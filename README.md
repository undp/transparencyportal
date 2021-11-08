Codebase for [UNDP Transparency Portal](https://open.undp.org)
===

UNDP has a long-standing commitment to transparency, with Country Offices publishing financial, procurement and programme information on respective websites on an annual basis.

[Open.undp.org](https://open.undp.org), UNDP's online portal allows open, comprehensive public access to data on more than 10,000 UNDP projects, and publishes over US$5.8 billion in project data. 

The site runs on [Preact](https://preactjs.com) and [Django](https://www.djangoproject.com). 

Contains 2 subfolders

    1. undp-transparency-portal-fe - Preact
    
    2. undp-transparency-portal-be - Django
    
Each folder has a separate README file to guide you with the installation process.

**Database Schema Structure and Modules**
==

**UNDP Transparency Portal Database Schema**
--
[View the schema diagram ](https://github.com/undp/transparencyportal/blob/master/Documents/Database_Schema.png) 

Database will be populated while running the command:
    
    python manage.py intiate_automation

**UNDP Transparency Portal Modules**
--

* **master_tables:**
    * Basic initial models and their corresponding APIs.
    * contains fixture for document categories, sdg_color and project timeline.
    * **Models**: Bureau, Region, OperatingUnit, Organisation, Sector, DocumentCategory, ProjectTimeLine, MapBoundary, Sdg, SdgTargets, SignatureSolution

* **undp_admin:**
    * UNDP django admin panel to view logs and manage the About Us page contents.
    * **Models**: AdminLog, AboutUs

* **undp_donors:**
    * Models and APIs for each project/output related expense/budget, organization based contributions, donor categories, fund type and fund streams.
    * **Models**: DonorFundSplitUp, DonorFundModality

* **undp_extra_features:**
    * APIs and templates for Embed and Export features.
    * download_api_view.py file has a view for Open APIs.
    * **Model**: ProjectYearSummary

* **undp_outputs:**
    * Project output related models and APIs.
    * Models for mapping the project outputs to the projects model, mapping the project outputs with the master models, mapping output with active years.
    * contains Our Approaches Marker Types and Parent Markers Types.
    * **Models**: Output, ActivityDate, OutputSector, OutputSdg, CountryBudget, CountryBudgetItem, Budget, OutputParticipatingOrganisation, OutputTransaction, OutputLocation, OutputResult, OutputResultPeriod, OutputActiveYear, OutputTarget, ProjectMarker, SDGChartColor, StoryMap

* **undp_projects:**
    * Project based models and APIs.
    * Models for mapping project with the master models, mapping project with active year.
    * contains automation.py file to initiate the insertion of all uploaded data from the ZIP Download link.
    * **Models**: Project, ProjectParticipatingOrganisations, ProjectDocument, ProjectActiveYear, ProjectActivityDate, SectorAggregate, ProjectAggregate, CountryResult, CountryResultPeriod, Log, DownloadLog, CountryDocument, ProjectSdg, ProjectTarget, ProjectSearch, SDGSunburst, SDGMap

* **undp_purchase_orders:**
    * Vendor classification, Purchase Order models and corresponding APIs.
    * **Models**: Vendor, PurchaseOrder

* **undp_transperancy:**
    * basic settings folder.



