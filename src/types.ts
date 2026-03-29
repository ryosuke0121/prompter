export interface PrompterPage {
  id: number;
  title: string;
  content: string;
}

export interface PrompterFile {
  title: string;
  pages: PrompterPage[];
  textColor?: string;
}

export interface PrompterDisplayData {
  page: PrompterPage;
  textColor: string;
}
