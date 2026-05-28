from django.db import migrations, models


def set_current_balance(apps, schema_editor):
    Fund = apps.get_model('funds', 'Fund')
    for fund in Fund.objects.all():
        fund.current_balance = fund.total_budget
        fund.save(update_fields=['current_balance'])


class Migration(migrations.Migration):

    dependencies = [
        ('funds', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='fund',
            name='current_balance',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
            preserve_default=False,
        ),
        migrations.RunPython(set_current_balance, reverse_code=migrations.RunPython.noop),
    ]
