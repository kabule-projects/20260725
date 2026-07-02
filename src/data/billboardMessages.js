const DEFAULT_SILHOUETTE_MESSAGE = '还没找到这里的商品，晚点再来吧';

export const billboardMessages = {
  '2014': '定制文案2014',
  '2015': '定制文案2015',
  '2016': '定制文案2016',
  '2017': '定制文案2017',
  '2018': '定制文案2018',
  '2019': '定制文案2019',         
  '2020': '定制文案2020',
  '2021': '定制文案2021',
  '2022': '定制文案2022',
  '2023': '定制文案2023',
  '2024': '定制文案2024',
  '2025': '定制文案2025',
  '2026': '定制文案2026'
};

export const getBillboardMessage = (year, accessStatus) => {
  switch (accessStatus) {
    case 'locked':
      return DEFAULT_SILHOUETTE_MESSAGE;
    case 'accessible':
      return `请去${year}加入回忆，解锁这件商品`;
    case 'unlocked':
      return billboardMessages[year] || '记忆已照亮';
    default:
      return '';
  }
};