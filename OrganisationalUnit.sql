CREATE TABLE [dbo].[OrganisationalUnit] ( 
    [ID]					  INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [label]					  VARCHAR(100) NOT NULL unique,
    [pupil-group-label]		  VARCHAR(100) NOT NULL,
	[subject-label]			  VARCHAR(100) NOT NULL,
	[notes]					  VARCHAR(8000) NOT NULL,
	[owner]					  VARCHAR(200) NOT NULL,
	[period-label]			  VARCHAR(200) NOT NULL
);

SET IDENTITY_INSERT [dbo].[OrganisationalUnit] OFF