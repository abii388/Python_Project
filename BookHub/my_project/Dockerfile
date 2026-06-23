From python:3.10-slim
workdir /myapp
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ExPOSE 8000
CMD ["python","manage.py","runserver","0.0.0:8000"]