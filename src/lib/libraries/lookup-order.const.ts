export const ORDER_INFO_SQL = `
SELECT
	[s].[SalesOrderId],
	[s].[Status],
	[s].[TotalDue],
	[c].[Title],
	[c].[FirstName],
	[c].[LastName],
	[c].[CompanyName],
	[a].[City],
	[a].[StateProvince]
FROM [SalesLT].[SalesOrderHeader] [s]
	INNER JOIN [SalesLT].[Customer] [c]
	ON [s].[CustomerID]=[c].[CustomerID]
	INNER JOIN [SalesLT].[Address] [a]
	ON [s].[ShipToAddressID]=[a].[AddressID]
WHERE [c].[CustomerID]=@CustomerId`;

export const ORDER_DETAILS_SQL = `
SELECT
	[sd].[OrderQty],
	[sd].[LineTotal],
	[p].[Color],
	[p].[Size],
	[pm].[Name]
FROM [SalesLT].[SalesOrderHeader] [s]
	INNER JOIN [SalesLT].[SalesOrderDetail] [sd]
	ON [s].[SalesOrderId]=[sd].[SalesOrderId]
	INNER JOIN [SalesLT].[Product] [p]
	ON [sd].[ProductID]=[p].[ProductId]
	INNER JOIN [SalesLT].[ProductModel] [pm]
	ON [p].[ProductModelID]=[pm].[ProductModelID]
WHERE [sd].[SalesOrderId]=@OrderId`;

export enum ORDER_STATUS {
  InProcess = 1,
  Approved,
  BackOrdered,
  Rejected,
  Shipped,
  Canceled,
}

export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.InProcess]: 'In Process',
  [ORDER_STATUS.Approved]: 'Approved',
  [ORDER_STATUS.BackOrdered]: 'Back Ordered',
  [ORDER_STATUS.Rejected]: 'Rejected',
  [ORDER_STATUS.Shipped]: 'Shipped',
  [ORDER_STATUS.Canceled]: 'Canceled',
};

export const ORDER_STATUS_VERB = {
  [ORDER_STATUS.InProcess]: 'is',
  [ORDER_STATUS.Approved]: 'is',
  [ORDER_STATUS.BackOrdered]: 'is',
  [ORDER_STATUS.Rejected]: 'was',
  [ORDER_STATUS.Shipped]: 'has',
  [ORDER_STATUS.Canceled]: 'was',
};
