CREATE TABLE [dbo].[Period] ( 
    [ID]            INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [label]         VARCHAR(100) NOT NULL unique,
    [from]          date NOT NULL,
	[till]          date NOT NULL,
	[active]		bit NOT NULL Default 0
);

SET IDENTITY_INSERT [dbo].[Period] OFF