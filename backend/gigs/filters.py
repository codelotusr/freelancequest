from django_filters import rest_framework as filters

from .models import Gig, Review


class GigFilter(filters.FilterSet):
    min_price = filters.NumberFilter(
        field_name="price", lookup_expr="gte", method="filter_min_price"
    )
    max_price = filters.NumberFilter(
        field_name="price", lookup_expr="lte", method="filter_max_price"
    )
    skill_ids = filters.BaseInFilter(field_name="skills__id", lookup_expr="in")

    class Meta:
        model = Gig
        fields = ["status", "client", "freelancer", "skill_ids"]

    def filter_min_price(self, queryset, name, value):
        if value not in [None, ""]:
            return queryset.filter(**{name: value})
        return queryset

    def filter_max_price(self, queryset, name, value):
        if value not in [None, ""]:
            return queryset.filter(**{name: value})
        return queryset


class ReviewFilter(filters.FilterSet):
    gig__freelancer__username = filters.CharFilter(
        field_name="gig__freelancer__username", lookup_expr="iexact"
    )

    class Meta:
        model = Review
        fields = [
            "gig__freelancer__username",
        ]
