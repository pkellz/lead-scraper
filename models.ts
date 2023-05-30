export interface IPage {
  companies: ICompanies;
}

interface ICompanies {
  list: ICompany[];
}

interface ICompany {
  name: string;
  contactInfo: {
    phone: string;
  };
}

export interface ILead {
  companyName: string;
  phone: string;
}
