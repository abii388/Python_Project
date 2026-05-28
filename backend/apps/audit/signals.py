from decimal import Decimal

from django.db.models import Model
from django.db.models.fields.files import FieldFile
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from apps.transactions.models import Transaction
from apps.funds.models import Fund
from .models import AuditLog


def get_model_fields_as_dict(instance):
    data = {}

    for field in instance._meta.fields:

        try:
            value = getattr(instance, field.name)
        except Exception:
            value = None

        if isinstance(value, FieldFile):
            value = value.name if value else None

        elif isinstance(value, Decimal):
            value = str(value)

        elif hasattr(value, 'isoformat'):
            value = value.isoformat()

        elif isinstance(value, Model):
            value = str(value.pk)

        elif isinstance(value, dict):
            value = value.copy()

        elif isinstance(value, (list, tuple, set)):
            value = list(value)

        elif value is not None and not isinstance(
            value, (str, int, float, bool)
        ):
            value = str(value)

        data[field.name] = value

    return data


# Store old values temporarily before save
@receiver(pre_save, sender=Transaction)
@receiver(pre_save, sender=Fund)
def store_old_values(sender, instance, **kwargs):

    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_values = get_model_fields_as_dict(old_instance)

        except sender.DoesNotExist:
            instance._old_values = None


@receiver(post_save, sender=Transaction)
@receiver(post_save, sender=Fund)
def log_audit(sender, instance, created, **kwargs):

    if created:

        AuditLog.objects.create(
            action="CREATE",
            model_name=sender.__name__,
            object_id=str(instance.pk),
            old_values=None,
            new_values=get_model_fields_as_dict(instance)
        )

    else:

        AuditLog.objects.create(
            action="UPDATE",
            model_name=sender.__name__,
            object_id=str(instance.pk),
            old_values=getattr(instance, '_old_values', None),
            new_values=get_model_fields_as_dict(instance)
        )


@receiver(post_delete, sender=Transaction)
@receiver(post_delete, sender=Fund)
def log_delete(sender, instance, **kwargs):

    AuditLog.objects.create(
        action="DELETE",
        model_name=sender.__name__,
        old_values=get_model_fields_as_dict(instance),
        new_values=None
    )