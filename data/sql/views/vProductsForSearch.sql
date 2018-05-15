CREATE VIEW [SalesLT].[vProductsForSearch]
AS
SELECT
	[pm].[name],
	[pm].[productModelId],
	(CASE WHEN [pm].[name] LIKE '%-W' THEN 'Woman' WHEN [pm].[name] LIKE '%-M' THEN 'Man' ELSE 'Unisex' END) [sex],
	[pm].[modifiedDate],
	(SELECT cast(max(standardCost) AS float) FROM [SalesLt].[Product] WHERE [productModelId]=[pm].[productModelId]) [maxStandardCost],
	(SELECT cast(min(standardCost) AS float) FROM [SalesLt].[Product] WHERE [productModelId]=[pm].[productModelId]) [minStandardCost],
	(SELECT cast(max(listPrice) AS float) FROM [SalesLt].[Product] WHERE [productModelId]=[pm].[productModelId]) [maxListPrice],
	(SELECT cast(min(listPrice) AS float) FROM [SalesLt].[Product] WHERE [productModelId]=[pm].[productModelId]) [minListPrice],
	(SELECT [category] FROM ufnGetCategory([productModelId])) [category],
	(SELECT dbo.ufnGetColorsJson([productModelId])) [colors],
	(SELECT dbo.ufnGetSizesJson([productModelId])) [sizes],
	(SELECT cast([deleted] AS VARCHAR(1)) FROM ufnIsDeleted([productModelId])) [deleted],
	(SELECT [color], [size], [productNumber] FROM ufnGetProductAttributes([productModelId]) FOR JSON PATH) [products],
	(SELECT [description] FROM ufnGetDescription('he', [productModelId])) [description_HE],
	(SELECT [description] FROM ufnGetDescription('zh-cht', [productModelId])) [description_ZH_CHT],
	(SELECT [description] FROM ufnGetDescription('en', [productModelId])) [description_EN],
	(SELECT [description] FROM ufnGetDescription('ar', [productModelId])) [description_AR],
	(SELECT [description] FROM ufnGetDescription('th', [productModelId])) [description_TH],
	(SELECT [description] FROM ufnGetDescription('fr', [productModelId])) [description_FR]
FROM
	[SalesLt].[ProductModel] [pm]