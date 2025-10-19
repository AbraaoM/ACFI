# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configure pip with larger timeouts and retry
RUN pip install --upgrade pip

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies in stages with retry and robust settings
RUN pip install --no-cache-dir \
    --timeout 3000 \
    --retries 10 \
    --index-url https://pypi.org/simple/ \
    --trusted-host pypi.org \
    --trusted-host pypi.python.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt || \
    (sleep 30 && pip install --no-cache-dir --timeout 300 --retries 5 -r requirements.txt)

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p data uploads

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]