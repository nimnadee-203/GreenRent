Quick Reference
Method	        Endpoint	             Auth	            Description
GET 	    /api/properties	        Public	            List all properties
GET	        /api/properties/:id	    Public	            Get property by ID
POST	    /api/properties	        Landlord / Admin	Create a property
PUT 	    /api/properties/:id	    Owner / Admin	    Update a property
DELETE	    /api/properties/:id	    Owner / Admin	    Delete a property

=======================================================================================

Search and Filtering
GET /api/properties?propertyType=apartment&minPrice=500&maxPrice=2000&sortBy=price&sortOrder=asc&limit=10&skip=0

=======================================================================================

Validation

Field	                    Type	         	       Validation
title	                    string		             Min 5 characters
description	                string		             Min 10 characters
location	                object		             See nested fields below
location.address	        string		             Non-empty string
location.coordinates	    object		             See nested fields below
location.coordinates.lat	number		             Between -90 and 90
location.coordinates.lng	number		             Between -180 and 180
price	                    number		             Positive number (≥ 0)
propertyType	            string		     apartment, house, studio, townhouse, other
ecoFeatures	                object		        An object describing eco features
images	                    string[]	             No	Array of image URLs

