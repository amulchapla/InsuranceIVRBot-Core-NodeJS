CREATE FUNCTION ufnIsDeleted(@productModelId int)
RETURNS TABLE AS RETURN
SELECT
	CASE WHEN (
		(SELECT COUNT(*) FROM ufnGetProductAttributes(@productModelId) WHERE [SellEndDate] IS NOT NULL OR [DiscontinuedDate] IS NOT NULL)
		=
		(SELECT COUNT(*) FROM ufnGetProductAttributes(@productModelId))
	) THEN 1 ELSE 0 END [deleted]