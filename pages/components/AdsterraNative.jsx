// studio/pages/components/AdsterraNative.jsx
'use client';
import { useEffect } from 'react';

export default function AdsterraNative() {
  useEffect(() => {
    if (document.getElementById('adsterra-native')) return;

    // Replace the text between backticks with your Adsterra snippet.
    // The code below will auto-detect if Adsterra gave a <script src="..."></script> or inline script.
    const snippet = `<script async="async" data-cfasync="false" src="//pl27580372.revenuecpmgate.com/1ec78109eb17af3ef10b69a8c3ccf110/invoke.js"></script>
<div id="container-1ec78109eb17af3ef10b69a8c3ccf110"></div>`;

    const container = document.createElement('div');
    container.id = 'adsterra-native';
    container.style.cssText = 'width:100%;display:flex;justify-content:center;margin:15px 0;';

    // try to detect <script src="..."></script>
    const srcMatch = snippet.match(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/i);
    if (srcMatch) {
      const s = document.createElement('script');
      s.src = srcMatch[1];
      s.async = true;
      container.appendChild(s);
    } else {
      // remove outer <script> tags if user pasted whole <script>...</script>
      const inner = snippet.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.appendChild(document.createTextNode(inner));
      container.appendChild(s);
    }

    // insert near top of body (you can change position if needed)
    document.body.insertBefore(container, document.body.firstChild);
  }, []);

  return null;
        }
