class K:
    def __init__(self, label=None, **kwargs):
        assert(len(kwargs) == 1)
        for k, v in kwargs.items():
            self.id = k
            self.v = v
        self.label = label or self.id


class Konstants:
    def __init__(self, *args):
        self.klist = args
        for k in self.klist:
            setattr(self, k.id, k.v)

    def choices(self):
        return [(k.v, k.label) for k in self.klist]

    def get_label(self, key):
        for k in self.klist:
            if k.v == key:
                return k.label
        return None

    def get_value(self, label):
        for k in self.klist:
            if k.label == label:
                return k.v
        return None

    def get_value_from_key(self, key):
        for k in self.klist:
            if k.k == key:
                return k.v
        return None

    def get_all_keys(self):
        return [k.id for k in self.klist]

    def get_all_values(self):
        return [k.v for k in self.klist]

    def get_all_labels(self):
        return [k.label for k in self.klist]


SEARCH_MODELS = Konstants(K(project=1, label='Project'),
                          K(country_profile=2, label='Country Profile'),
                          K(theme=3, label='Theme'),
                          K(sdg=4, label='SDGs'))

LOCATION_EXACTNESS = Konstants(K(exact=1, label='Exact'),
                               K(approximate=2, label='Approximate'))


LOCATION_CLASSES = Konstants(K(admin=1, label='Administrative Region'),
                             K(populated=2, label='Populated Place'),
                             K(structure=3, label='Structure'),
                             K(topo=4, label='Other Topographical Feature')
                             )

LOG_TYPE = Konstants(K(output='1', label='Output'),
                     K(output_part_org='2', label='Output Participating Org'),
                     K(output_location='3', label='Output Location'),
                     K(output_sector='4', label='Output Sector'),
                     K(output_country_budget='5', label='Output Country Budget Items'),
                     K(output_budget='6', label='Output Budget'),
                     K(output_transaction='7', label='Output Transaction'),
                     K(output_result='8', label='Output Result'),
                     K(output_activity_date='8', label='Output Activity Date'),
                     K(project_cron='2', label='Project Cron'),
                     K(master_cron='ms_cron', label='Master Cron'),
                     K(donor_cron='dn_cron', label='Donor Cron'),)


DONOR_CATEGORY_COLORS = Konstants(
    K(pooled_funding='f8c486', label='Pooled Funding'),
    K(private_sector='f6aaa9', label='Private Sector'),
    K(vertical_funding='f59942', label='Vertical Funding'),
    K(multilaterals='cdbcdb', label='Other Multilaterals'),
    K(ngos='caaea6', label='NGOs'),
    K(dac_donors='5b8cc0', label='DAC Donors'),
    K(programme_countries='c0ceeb', label='Programme Countries'),
    K(others='e08bcc', label='Others Unidentified'),
    K(financing='d25053', label='Financing Institutions'),
    K(un_agencies='afe69e', label='UN Agencies'),
    K(european_union='61b353', label='European Union'),
    K(non_dac_non_pgm='9c766d', label='Non-DAC and non-programme country'),
    K(non_dac='808080', label='Non-DAC Donors'),
    K(foundations='a67dc8', label='Foundations'),
    K(undp_regular='8d8fd4', label='UNDP Regular Resources'),
    K(new_mapping_1='9c766d', label='Non-DAC and programme governments'),
    K(new_mapping_2='f6aaa9', label='Private Sector/Foundations/NGOs'),
)


BUREAU_COLORS = Konstants(
    K(PAPP='00fa9a', label='PAPP'),
    K(RBLAC='bfc739', label='Latin America & the Caribbean'),
    K(GLOBAL='00ced1', label='Global and Others'),
    K(RBEC='dce198', label='Europe and CIS'),
    K(RBAP='949494', label='Asia and the Pacific'),
    K(RBAS='d0d0d0', label='Arab States'),
    K(RBA='f2c1d9', label='Africa'),
)


PROJECT_CSV_ITEMS = Konstants(
    K(outputs=1, label='Outputs'),
    K(documents=2, label='Documents'),
    K(purchase_orders=3, label='PurchaseOrders'),
)


PROJECT_ACTIVITY_TYPES = Konstants(
    K(planned_start=1, label="Planned Start date"),
    K(actual_start=2, label="Actual Start date"),
    K(planned_end=3, label="Planned End date"),
    K(actual_end=4, label="Actual End date"),
)


ORGANISATION_ROLES = Konstants(
    K(implementing=4, label='Implementing Organisation')
)


