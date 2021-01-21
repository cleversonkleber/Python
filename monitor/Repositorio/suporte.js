




{Expression: if(Int(Sum(WorkingDaysDateDif(Today(),
    ConvertToDateTime(GetMetadataRawValue("Data programada"),"en-us")),-1))<=0,1,
    Int(Sum(WorkingDaysDateDif(Today(),
    ConvertToDateTime(GetMetadataRawValue("Data programada"),"en-us")),-1)))}


    1733376

    /// Cadastrar Cliente CPP



    {Expression: if(Int(Sum(WorkingDaysDateDif
        (ConvertToDateTime("07/13/2020 03:00:00","en-us"),
        ConvertToDateTime("07/17/2020 03:00:00"),-1))<=0,1,
        Int(Sum(WorkingDaysDateDif(ConvertToDateTime("07/13/2020 03:00:00","en-us"),
        ConvertToDateTime("07/17/2020 03:00:00","en-us")),-1)))}



        {Expression: if(Int(Sum(WorkingDaysDateDif(ConvertToDateTime("07/13/2020 03:00:00","en-us"),
            ConvertToDateTime("07/17/2020 03:00:00","en-us")),-1))<=0,1,
            Int(Sum(WorkingDaysDateDif(ConvertToDateTime("07/13/2020 03:00:00","en-us"),
            ConvertToDateTime(ConvertToDateTime("07/17/2020 03:00:00"),"en-us")),-1)))}
            

            {Expression: if(Int(Sum(WorkingDaysDateDif(ConvertToDateTime("07/01/2020 03:00:00","en-us"),
            ConvertToDateTime("07/04/2020 03:00:00","en-us")),-1))<=0,1,
            Int(Sum(WorkingDaysDateDif(ConvertToDateTime("07/01/2020 03:00:00","en-us"),
            ConvertToDateTime("07/04/2020 03:00:00","en-us")),-1)))}  
            
            {Expression:WorkingDaysDateDif(ConvertToDateTime("07/01/2020 03:00:00","en-us"),
            ConvertToDateTime("07/04/2020 03:00:00","en-us"))}
            








