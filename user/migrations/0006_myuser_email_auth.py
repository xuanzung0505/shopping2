# Generated by Django 4.1.3 on 2022-11-09 03:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_auto_20221026_2256'),
    ]

    operations = [
        migrations.AddField(
            model_name='myuser',
            name='email_auth',
            field=models.BooleanField(default=False),
        ),
    ]
