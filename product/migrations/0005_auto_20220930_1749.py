# Generated by Django 2.2 on 2022-09-30 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0004_item'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='description',
            field=models.TextField(default='', max_length=255, null=True),
        ),
    ]
