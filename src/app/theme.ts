import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#1890ff',
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Table: {
      borderRadius: 6,
    }
  }
};

export default theme;
