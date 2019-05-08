Features
=============
- Django 1.11
- Uses [pip](https://www.pypa.io/en/latest/) and [Virtualenv](https://pypi.org/project/virtualenv)
- HTTPS and other security related settings on Staging and Production.
- PostgreSQL database support with psycopg2.


How to Install
---------------

Activate Virtual Env
>$ source venv/bin/activate

Install Requirements
>$pip3 install -r requirements.txt

Create a postgres db and add the credentials to `settings.py`

>python manage.py makemigrations

>python manage.py migrate --database=mirror1

To start server
>python manage.py runserver

 `http://localhost:8000` to view the app.

### Import Data

To import latest data from the UNDP. Please run this command.

>python manage.py intiate_automation 

This downloads data from [ZIP_DOWNLOAD_URL](https://github.com/undp/transparencyportal/blob/master/undp-transparency-portal-be/utilities/config.py#L26) link and loads data to the database.
