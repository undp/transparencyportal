from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from undp_donors.api_views import DonorFundSplitUpView, RecipientBudgetSourcesView, \
    FundAggregateView, TopRecipientOfficesView, DonorsListView, DonorBudgetSourcesView, \
    DonorContribution, SankeyBudgetView, SankeyExpenseView, TopBudgetSourcesView, DonorCountryAggregate,\
    DonorCountryFundModalityView

urlpatterns = [
    url(r'^aggregate', DonorCountryAggregate.as_view()),
    # url(r'^org_aggregate', DonorAggregate.as_view()),
    url(r'^fin_split_up', DonorFundSplitUpView.as_view()),
    url(r'^recipient_budget_sources', RecipientBudgetSourcesView.as_view()),
    url(r'^fund_modality', DonorCountryFundModalityView.as_view()),
    # url(r'^org_fund_modality', DonorFundModalityView.as_view()),
    url(r'^fund_aggregate', FundAggregateView.as_view()),
    url(r'^contribution', DonorContribution.as_view()),

    url(r'^top_recipient_offices', TopRecipientOfficesView.as_view()),
    url(r'^top_budget_sources', TopBudgetSourcesView.as_view()),
    url(r'^list', DonorsListView.as_view()),
    url(r'^budget_sources', DonorBudgetSourcesView.as_view()),
    url(r'^sankey_budget', SankeyBudgetView.as_view(), name='sankey-budget'),
    url(r'^sankey_expense', SankeyExpenseView.as_view(), name='sankey-expense'),

]
