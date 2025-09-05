'use client';
import { useEffect } from 'react';

export default function AdsterraBanner() {
  useEffect(() => {
    if (document.getElementById('adsterra-banner')) return;
    const div = document.createElement('div');
    div.id = 'adsterra-banner';
    div.style.cssText = 'width:100%;display:flex;justify-content:center;margin:10px 0;';
    div.innerHTML = `<script type="text/javascript">
	atOptions = {
		'key' : '4adca45db1a5946d7abce13aaa4bb19c',
		'format' : 'iframe',
		'height' : 50,
		'width' : 320,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/4adca45db1a5946d7abce13aaa4bb19c/invoke.js"></script>`;
    document.body.insertBefore(div, document.body.firstChild);
  }, []);

  return null;
}
