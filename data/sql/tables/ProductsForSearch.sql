-- Azure Search cannot read the view's schema, so copy it to static table
SELECT  *
INTO    [SalesLT].[ProductsForSearch]
FROM    [SalesLT].[vProductsForSearch]