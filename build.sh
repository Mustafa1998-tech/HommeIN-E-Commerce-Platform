#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Initial database setup (safe to run multiple times)
python -m database.init_db
