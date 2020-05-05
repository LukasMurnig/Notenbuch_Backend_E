CREATE TABLE [dbo].[Pupil] ( 
    [ID]					  INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [Identifier]			  VARCHAR(100) NOT NULL unique,
    [birthdt]				  date NOT NULL,
	[firstname]			      VARCHAR(100) NOT NULL,
	[lastname]				  VARCHAR(100) NOT NULL,
	[notes]					  VARCHAR(8000) NOT NULL,
	[mail]					  VARCHAR(200) NOT NULL
);

SET IDENTITY_INSERT [dbo].[Pupil] OFF