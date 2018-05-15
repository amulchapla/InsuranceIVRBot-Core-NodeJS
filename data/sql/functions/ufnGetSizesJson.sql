CREATE FUNCTION ufnGetSizesJson(@productModelId int)
RETURNS nvarchar(max)
AS 
BEGIN
  DECLARE @vals AS nvarchar(max)
  SELECT
    @vals = COALESCE(@vals + ',"', '"') + [t].[size] + '"'
  FROM
    (
      SELECT
        DISTINCT [size]
      FROM
        [SalesLt].[Product] [p]
      WHERE
        [p].[productModelId]=@productModelId
    ) [t]
  RETURN '[' + @vals + ']'
END