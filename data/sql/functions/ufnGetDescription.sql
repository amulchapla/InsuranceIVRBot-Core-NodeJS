CREATE FUNCTION ufnGetDescription(@culture nvarchar(400), @productModelId int)
RETURNS TABLE AS RETURN
	SELECT
		[pd].[description]
	FROM
		[SalesLt].[ProductModelProductDescription] [pmpd] INNER JOIN
		[SalesLt].[ProductDescription] [pd] ON [pmpd].[productDescriptionId]=[pd].[productDescriptionId]
	WHERE
		[pmpd].[culture]=@culture AND 
		[pmpd].[productModelId]=@productModelId