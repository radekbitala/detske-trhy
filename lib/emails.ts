export const EMAIL_TEMPLATES = {
  // Potvrzení registrace - posílá se ihned po odeslání formuláře
  registration_confirmed: {
    subject: 'Potvrzení registrace na Dětské trhy 2026',
    html: (childName: string, stallName: string, hasVideo: boolean, uploadUrl?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C8102E;">🎪 Dětské trhy – Srdcem pro lepší svět</h2>

        <p>Dobrý den,</p>

        <p>Děkujeme za registraci dítěte <strong>${childName}</strong> se stánkem <strong>"${stallName}"</strong> na Dětské trhy <strong>24. května 2026</strong>.</p>

        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #065f46;">✓ Vaše registrace byla úspěšně přijata</strong>
        </div>

        ${hasVideo ? `
        <p>Video prezentace byla nahrána a bude posouzena. O výsledku vás budeme informovat emailem.</p>
        ` : `
        <p><strong>Pro dokončení registrace prosím nahrajte krátké video (20-40 sekund)</strong> představující váš projekt. Termín pro nahrání: <strong>28. února 2026</strong>.</p>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📹 Nahrát video:</strong><br>
          <a href="${uploadUrl}" style="color: #C8102E; word-break: break-all;">${uploadUrl}</a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">Video můžete nahrát kdykoliv do uvedeného termínu. Odkaz zůstává platný.</p>
        `}

        <h3 style="color: #4b5563;">Co bude následovat?</h3>
        <ul>
          <li>Pořadatel zkontroluje vaši registraci a téma stánku</li>
          <li>Po schválení obdržíte další email s podrobnostmi</li>
          <li>Máte-li dotazy, neváhejte nás kontaktovat</li>
        </ul>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 14px;">
          S pozdravem,<br>
          <strong>Calm2be z.s.</strong><br>
          📞 <a href="tel:+420602282276">602 282 276</a> | ✉️ <a href="mailto:veronika@calm2be.cz">veronika@calm2be.cz</a>
        </p>
      </div>
    `
  },

  theme_approved: {
    subject: 'Registrace na Dětské trhy je platná – nahrajte video',
    html: (childName: string, uploadUrl?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C8102E;">🎪 Dětské trhy – Srdcem pro lepší svět</h2>

        <p>Dobrý den,</p>

        <p>Vaše registrace dítěte <strong>${childName}</strong> na Dětské trhy <strong>24. května 2026</strong> je platná.</p>

        <p><strong>Aby byla registrace dokončena, nahrajte prosím videonahrávku záměru stánku do 28. února 2026.</strong></p>

        ${uploadUrl ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📹 Nahrát video:</strong><br>
          <a href="${uploadUrl}" style="color: #C8102E; word-break: break-all;">${uploadUrl}</a>
        </div>
        ` : ''}

        <ul>
          <li>Nahrávka bude použita pro hodnotící porotu i pro případné návrhy na zlepšení</li>
          <li>Doporučujeme délku cca 20 sekund, max. 40 sekund</li>
          <li>Výsledek hodnocení Vám bude sdělen do 5 pracovních dní</li>
          <li>Nahrávka může být použita také k veřejné prezentaci pořadatele</li>
        </ul>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 14px;">
          S pozdravem,<br>
          <strong>Calm2be z.s.</strong><br>
          veronika@calm2be.cz | 602 282 276
        </p>
      </div>
    `
  },
  
  video_approved: {
    subject: 'Jupííí, vítáme vás na Dětských trzích! 🎉',
    html: (childName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C8102E;">🎪 Dětské trhy – Srdcem pro lepší svět</h2>
        
        <p><strong style="font-size: 18px; color: #16a34a;">Jupííí, vítáme vás na trhu!</strong></p>
        
        <p>Gratulujeme! Registrace dítěte <strong>${childName}</strong> je kompletní a těšíme se na společný den plný obchodování.</p>
        
        <h3 style="color: #4b5563;">Co teď?</h3>
        <ul>
          <li>✨ Můžete zahájit výrobu výrobků či přípravu vaší služby</li>
          <li>📣 Nezapomeňte na marketing – doporučujeme si vyrobit pozvánku na akci</li>
          <li>👨‍👩‍👧‍👦 Zvěte své okolí: babičky, tetičky, kámoše, učitelky apod.</li>
        </ul>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📅 Workshop pro nové trhovce</strong><br>
          23. dubna od 15:00 hod<br>
          <em>Kdo neví jak na to, přijďte!</em>
        </div>
        
        <h3 style="color: #4b5563;">V den konání akce (24. května 2026)</h3>
        <ul>
          <li>Doporučujeme dorazit cca v 9:00 hod</li>
          <li>Ze strany pořadatele budete mít k dispozici stůl, jednu židli a jednotné označení stánku</li>
        </ul>
        
        <p><strong>Velikost stánku:</strong></p>
        <ul>
          <li>Více dětí na stánku (do 10 let): 1,8m × 0,7m</li>
          <li>Starší děti na stánku samy: 1,2m × 0,7m</li>
        </ul>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>💰 Poplatek za stánek</strong><br>
          500 Kč – vybírá se na místě, až si stánek vydělá
        </div>
        
        <p><strong>Zájem o bezúročnou půjčku?</strong> Aneb chci si to vyzkoušet celé sám – volejte Veroniku.</p>
        
        <p><strong>Má Vaše dítě talent a chce na trzích vystoupit?</strong> Volejte prosím Veronice a domluvte se individuálně.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p>Máte-li jakýkoliv dotaz, volejte/pište Veronice:</p>
        <p>📞 <a href="tel:+420602282276">602 282 276</a> | ✉️ <a href="mailto:veronika@calm2be.cz">veronika@calm2be.cz</a></p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Děkujeme, že jste s námi! 💜<br>
          <strong>Calm2be z.s.</strong>
        </p>
      </div>
    `
  }
}
