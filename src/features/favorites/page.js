import { HistoryRepo } from '../../core/storage.js';
import { appBar, emptyState, icon } from '../../shared/ui.js';
import { recordItem, bindRecordList } from '../history/page.js';

export default {
  title: 'Favoriler',
  render(el) {
    el.innerHTML = `${appBar('Favoriler')}<main class="page"><div class="rec-list"></div></main>`;
    const list = el.querySelector('.rec-list');
    const draw = () => {
      const favs = HistoryRepo.favorites();
      list.innerHTML = favs.length ? favs.map(recordItem).join('')
        : emptyState('Favori yok', 'Bir hesaplamanın sonucunda "Favori" düğmesine veya geçmişteki yıldıza dokunarak buraya ekleyin.', 'star', `<a class="btn tonal" href="#history">${icon('history')}<span>Geçmişe git</span></a>`);
    };
    bindRecordList(list, draw);
    draw();
  },
};
