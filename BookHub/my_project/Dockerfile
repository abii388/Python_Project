From python:3.10-slim
workdir /myapp
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["gunicorn", "my_project.wsgi:application", "--bind", "0.0.0.0:10000"]