from django_filters import rest_framework as filters

from .models import Gig


class GigFilter(filters.FilterSet):
    min_price = filters.NumberFilter(
        field_name="price", lookup_expr="gte", method="filter_min_price"
    )
    max_price = filters.NumberFilter(
        field_name="price", lookup_expr="lte", method="filter_max_price"
    )

    class Meta:
        model = Gig
        fields = ["status", "client", "freelancer"]

    def filter_min_price(self, queryset, name, value):
        if value not in [None, ""]:
            return queryset.filter(**{name: value})
        return queryset

    def filter_max_price(self, queryset, name, value):
        if value not in [None, ""]:
            return queryset.filter(**{name: value})
        return queryset
