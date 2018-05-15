CREATE FUNCTION ufnGetProductAttributes(@productModelId int)
RETURNS TABLE AS RETURN
	SELECT *
	FROM [SalesLt].[Product] [p]
	WHERE [p].[productModelId]=@productModelId