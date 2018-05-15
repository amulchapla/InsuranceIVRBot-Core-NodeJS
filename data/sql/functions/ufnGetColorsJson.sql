CREATE FUNCTION ufnGetColorsJson(@productModelId int)
RETURNS nvarchar(max)
AS 
BEGIN
  DECLARE @vals AS nvarchar(max)
  SELECT
    @vals = coalesce(@vals + ',"', '"') + [t].[color] + '"'
  FROM
    (
      SELECT
        DISTINCT [color]
      FROM
        [SalesLt].[Product] [p]
      WHERE
        [p].[productModelId]=@productModelId
    ) [t]
  RETURN lower('[' + @vals + ']')
END