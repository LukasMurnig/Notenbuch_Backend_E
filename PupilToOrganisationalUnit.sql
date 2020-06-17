CREATE TABLE [dbo].[PupilToOrganisationalUnit] ( 
    [ID]					  INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
    [OULabel]					  VARCHAR(100) NOT NULL,
    [PIdentifier]				  VARCHAR(100) NOT NULL
);

SET IDENTITY_INSERT [dbo].[PupilToOrganisationalUnit] OFF