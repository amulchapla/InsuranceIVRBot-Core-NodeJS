CREATE FUNCTION ufnGetCategory(@productModelId int)
RETURNS TABLE AS RETURN
  SELECT TOP 1 
    lower(concat('["', [c].[ParentProductCategoryName], '","', [c].[ProductCategoryName], '"]')) [category]
  FROM
    [SalesLt].[Product] [p] INNER JOIN
    ufnGetAllCategories() [c] ON [p].[productCategoryId]=[c].[productCategoryId]
  WHERE [p].[productModelId]=@productModelId