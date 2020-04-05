CREATE TABLE [dbo].[User] ( 
    [ID]            INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [FirstName]         VARCHAR(100) NOT NULL,
    [LastName]          VARCHAR(100) NOT NULL,
	[UserName]          VARCHAR(200) NOT NULL unique,
	[Password]			VARCHAR(100) NOT NULL
);

SET IDENTITY_INSERT [dbo].[User] OFF