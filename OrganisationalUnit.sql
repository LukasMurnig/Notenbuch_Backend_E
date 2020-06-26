CREATE TABLE [dbo].[OrganisationalUnit] ( 
    [ID]					  INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [label]					  VARCHAR(100) NOT NULL unique,
    [pupil_group_label]		  VARCHAR(100) NOT NULL,
	[subject_label]			  VARCHAR(100) NOT NULL,
	[from]					  VARCHAR(5) NOT NULL,
	[till]					  VARCHAR(5) NOT NULL,
	[day]					  VARCHAR(9) NOT NULL,
	[notes]					  VARCHAR(8000) NOT NULL,
	[owner]					  VARCHAR(200) NOT NULL,
	[period_label]			  VARCHAR(200) NOT NULL
);

SET IDENTITY_INSERT [dbo].[OrganisationalUnit] OFF