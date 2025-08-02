USE [NewsArts-inews-mos]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ngn_inews_rundowns](
	[uid] [bigint] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](32) NULL,
	[lastupdate] [bigint] NOT NULL,
	[production] [bigint] NOT NULL,
	[enabled] [bit] NOT NULL,
	[tag] [nvarchar](max) NULL,
	[roID] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

