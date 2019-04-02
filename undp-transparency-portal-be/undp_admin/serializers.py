from rest_framework import serializers

from undp_admin.models import AboutUs


class AboutUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUs
        fields = '__all__'
        read_only_fields = ('created_date', 'modified_date')
