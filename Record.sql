CREATE TABLE [dbo].[Period] ( 
    [ID]            INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [value]         VARCHAR(100) NOT NULL unique,
    [date]          date NOT NULL,
	[created]          date NOT NULL,
    [modified]          date NOT NULL,
	[comment]			VARCHAR(200) NOT NULL
);

SET IDENTITY_INSERT [dbo].[Period] OFF