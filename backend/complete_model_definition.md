# Full Model Registry & Attributes

## AdminActivity
**Columns:** id, message, details

## Auction
**Columns:** AAuctionID, AAuctionDateTime, AAuctionPlace, AAuctionPlaceAddr1, AAuctionPlaceAddr2, AAuctionCity, AAuctionState, AAuctionZip, minimum_bid, AAuctionDescription, APropertyID, model, key

## Auctioneer
**Columns:** id, name, address, phone, email, web_site, html

## BorrowerNamePattern
**Columns:** id, pattern_level, borrower_name_pattern

## Cache
**Columns:** key, value

## CityCounty
**Columns:** id, city, county_id, model, key

## CityStateZip
**Columns:** id, city, state, zip

## County
**Columns:** id, name, index, use, address_template, num_fields

## CountyCityZip
**Columns:** id, county_id, model, key, city, zip

## CrawledCounties
**Columns:** id, date_time, site_id, model, key, county_id, model, key

## CrawlerConfig
**Columns:** site_id, model, key, crawler_name, proxy_yn, time_delay_yn, threads_yn, rotate_proxies_yn

## CrawlerLogAll
**Columns:** crawler_log_all_id, site_id, model, key, county, city, zipcode, firstname, middlename, lastname, streetnum, streetname, addressline2, data_url, text_dump, failed_yn

## CrawlerRun
**Columns:** CrawlerId, Stage, CrawlerFile, LogFile, CrawlerName, CrDataType, LastRunStart, LastRunEnd, RunStatus, Proxy, RotateProxy, TimeDelay, Enable, RunDetails

## Divorce
**Columns:** id, property_id, model, key, case_number, court_name, filing_date, legal_filing_date, attorney_name, divorce_type, petitioner_name, respondent_name, status, settlement_date, notes

## EncryptValue
**Columns:** encryptvalue_id, enc_table_name, enc_table_row_id, enc_column_name, encrypted_val

## ErroneousLinks
**Columns:** id, proaddress_id, model, key, ownername_id, model, key, url

## Errors
**Columns:** id, site_id, model, key, date_time, text

## Eviction
**Columns:** id, property_id, model, key, court_date, court_docket, plaintiff_name, court_desc, court_room, details

## ExportHistory
**Columns:** exportId, username, filename, recordCount, format, status, url, createdAt

## Feedback
**Columns:** id, Username, model, key, email, isIn, message, rating, min, max, status, isIn, adminNotes, createdAt, updatedAt

## FilesUrls
**Columns:** id, url, contents, property_card, parsed, site_id, model, key, county_id, model, key, html_md5, proaddress_id, model, key, ownername_id, model, key, motive_type_id, model, key, PMotiveType

## FreeUser
**Columns:** Username, model, key, createdAt, updatedAt

## FsboCounties
**Columns:** county, date_time

## History
**Columns:** id, page, ad_number, crawler_id

## Invoice
**Columns:** id, Username, model, key, amount, currency, status, isIn, date, description, downloadUrl, createdAt, updatedAt

## LenderAddressPattern
**Columns:** id, pattern_level, lender_address_pattern

## LenderNamePattern
**Columns:** id, pattern_level, lender_name_pattern

## Loan
**Columns:** id, property_id, model, key, deed_id, borrower_name, lender_name, lender_address, datetime, loan_amount, total_default_amount, foreclosure_stage, lis_pendens_date, arrears_amount, default_status

## LoanAmountPattern
**Columns:** id, pattern_level, loan_amount_pattern

## MotiveTypes
**Columns:** id, code, name

## Owner
**Columns:** id, OLastName, OMiddleName, OFirstName, OStreetAddr1, OStreetAddr2, OCity, OState, OZip, OProperty_id, model, key, insert_id, is_out_of_state, email

## Ownername
**Columns:** id, PLastName, PMiddleName, PFirstName, PcompanyName, PMotiveType, counties, html

## OwnerNamePattern
**Columns:** id, pattern_level, owner_name_pattern

## PagesUrls
**Columns:** id, url, use, date_time, page, county_id, site_id, model, key, motive_type_id, model, key

## PaymentMethod
**Columns:** id, Username, model, key, isIn, last4, brand, expiryMonth, expiryYear, email, isDefault, createdAt, updatedAt

## Poppin
**Columns:** id, name, title, message, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink, imageUrl, backgroundColor, textColor, accentColor, position, trigger, triggerValue, pages, isActive, priority, showOnMobile, showOnDesktop, dismissable, showOnce, emailPlaceholder, successMessage, startDate, endDate, countdownEnd

## PremiumUser
**Columns:** Username, model, key, subscriptionId, model, key, subscriptionStart, subscriptionEnd, paymentStatus, isIn, autoRenew, lastPaymentDate, nextBillingDate, usageStats, createdAt, updatedAt

## Proaddress
**Columns:** id, listing_id, PStreetNum, backup_street_name, PStreetName, PSuiteNum, Pcity, PState, Pzip, word, abbreviation, owner_name, PMotiveType, counties, price, url, beds, baths, owner_mailing_address, owner_current_state, proptype, square_feet, PYearBuilt, floors, school_district, garage_size, lot_size, amenities, comments, owner_phone, site_id, model, key, DATE_TIMEOFEXTRACTION, parsed, auctioneer, contact_image, auctioneer_id, model, key, sale_date, page_id, county_fixed, case_number, deed_book_page, ownername_id, model, key, property_trust_deed_id, model, key, trusteename, trusteecompanyname, trusteeaddress, trusteecity, trusteestate, trusteezip, trusteephone, trusteeemail, trusteewebsite, trusteetype, auction_amt, auctiondatetime, auctionplace, auctionplaceaddr1, auctionplaceaddr2, auctioncity, auctionstate, auctionzip, auctiondescription, auctioneername, auctioneercompanyname, auctioneeraddress, auctioneerphone, auctioneeremail, auctioneerweb_site, auctioneerhtml, court_docket, court_date, street_name_post_type, sale_time, skip_row, violation_complaint, violation_issue_date, violation_types, violation_total, violation_desc, violation_details, eviction_owner_lawyer_name, hash, streetnameposttype, violation_issued_by, PLastName, PMiddleName, PFirstName, PcompayName

## Probate
**Columns:** id, property_id, model, key, case_number, probate_court, probate_court_county, filing_date, date_of_death, estate_type, executor_name, executor_contact, estate_value, status, notes

## Property
**Columns:** id, PStreetAddr1, PStreetAddr2, Pcity, Pstate, Pzip, Pcounty, PBase, PBeds, PBaths, PLandBuilding, PType, PLastSoldAmt, PLastSoldDate, PTotLandArea, PTotBuildingArea, PTotSQFootage, PYearBuilt, PAppraisedBuildingAmt, PAppraisedLandAmt, PTotAppraisedAmt, motive_type_id, model, key, auctioneer_id, model, key, proaddress_id, model, key, PFilesUrlsId, model, key, PAuctioneerID, PComments, PDateFiled, PListingID, local_image_path

## PropertyAddressPattern
**Columns:** id, pattern_level, property_address_pattern

## PropertySkip
**Columns:** id, name, PStreetNum, PStreetName, Pzip, skip, Pcity, PState, counties

## PropertyTrustDeed
**Columns:** id, deed_id, county, property_address, owner_name, borrower_name, lender_name, lender_address, trustee_name, trustee_address, property_id, datetime, loan_amount

## PropertyTrustDeedSkip
**Columns:** id, trust_deed_doc, dttm

## Proxy
**Columns:** proxy_id, proxy_site_provider, proxy_site_url, proxy_site_port, userid, encryption_id, path_to_password

## Report
**Columns:** id, date

## Request
**Columns:** id, RS_Num, streetNum, streetName, locDescription

## RestartRow
**Columns:** restart_row_id, site_id, model, key, county, city, zipcode, data_url

## RunDates
**Columns:** site_id, model, key, min_run_dt, max_run_dt

## SavedProperty
**Columns:** id, Username, model, key, propertyId, notes

## SavedSearch
**Columns:** id, name, filters, Username, model, key

## Site
**Columns:** id, group_id, model, key, url, module, owner_format, property_format, tables_to_use, last_run, priority, crawler_name

## SiteContent
**Columns:** id, key, value, contentType

## SitesGroups
**Columns:** id, name

## Subscription
**Columns:** subscriptionId, planName, isIn, price, duration, features, status, isIn, description, popular, createdAt, updatedAt

## TaxLien
**Columns:** id, property_id, model, key, tax_year, amount_owed, last_tax_year_paid, lien_date, tax_authority, lien_number, status, sale_date, redemption_period_end, notes

## TimeDelay
**Columns:** site_id, model, key, delay_min_secs, delay_max_secs

## Trustee
**Columns:** TTrusteeID, TTrusteeName, TTrusteeAddress, TTRUSTEECity, TTRUSTEEState, TTRUSTEEZip, TTrusteePhone, TTrusteeEmail, TTrusteeWebSite

## TrusteeAddressPattern
**Columns:** id, pattern_level, trustee_address_pattern

## UserLogin
**Columns:** Username, FirstName, LastName, Email, Contact, Address, City, State, Pin, Password, UserType, isIn, ResetToken, ResetTokenExpires

## Violation
**Columns:** id, property_id, model, key, complaint, issue_date, types, short_desc, fine_amount, remediation_deadline, details, current_situation, resolution_date, compliance_status

## ZipCitySt
**Columns:** id, zip, county, state

