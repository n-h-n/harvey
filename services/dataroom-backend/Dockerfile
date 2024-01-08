# Use an official Python runtime as a parent image
FROM python:3.11-slim AS build-env

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
COPY . /app

# Create uploads directory
RUN mkdir -p uploads

# Dependency error fix with the slim image
RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && pip install psycopg2

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip &&\
    pip install -r requirements.txt

COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Run app.py when the container launches
CMD ["gunicorn", "--bind", "0.0.0.0:80", "--workers", "1", "--threads", "8", "--timeout", "0", "--reload", "app:app"]
