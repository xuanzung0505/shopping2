# Generated by Django 4.1.3 on 2022-11-09 03:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0021_alter_product_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='image',
        ),
    ]
