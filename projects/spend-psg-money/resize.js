const projectSlug = 'spend-psg-money';

const resize = () => {
      const dataUTILS = {
        for: 'BASIC_TEST',
        action: 'resizeIframe',
        selector: `iframe[src*=\\/projects\\/${projectSlug}]`,
        sizes: {
          height: 2 * Math.floor(document.body.scrollHeight / 2) + 10,
        },
      };

      window?.top?.postMessage(JSON.stringify(dataUTILS), '*');
    }

const resizeObserver = new ResizeObserver(() => {
  resize();
});
resizeObserver.observe(document.body);
resize();
setTimeout(() => {
  resize();
}, 100);
setTimeout(() => {
  resize();
}, 300);
setTimeout(() => {
  resize();
}, 500);
setTimeout(() => {
  resize();
}, 1000);
setTimeout(() => {
  resize();
}, 2000);