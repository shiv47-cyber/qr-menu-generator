// Utility to encode and decode restaurant menu data to/from a URL-safe Base64 string.
// This allows sharing/scanning menus without requiring a backend database.

export const DEFAULT_MENU = {
  restaurantName: "The Bistro Garden",
  theme: "emerald", // emerald, amber, rose, slate
  sections: [
    {
      id: "sec-1",
      name: "Starters",
      items: [
        {
          id: "item-1",
          name: "Truffle Parmesan Fries",
          description: "Crispy hand-cut golden fries tossed in white truffle oil, aged parmesan, and fresh rosemary.",
          price: "8.50",
          isVeg: true
        },
        {
          id: "item-2",
          name: "Stuffed Cremini Mushrooms",
          description: "Cremini mushrooms filled with garlic-herb cream cheese, spinach, and toasted panko crumbs.",
          price: "10.00",
          isVeg: true
        },
        {
          id: "item-3",
          name: "Glazed Pork Belly Bites",
          description: "Slow-roasted pork belly cubes glazed in a sweet soy-ginger reduction, topped with green onions.",
          price: "12.50",
          isVeg: false
        }
      ]
    },
    {
      id: "sec-2",
      name: "Mains",
      items: [
        {
          id: "item-4",
          name: "Artisanal Pesto Penne",
          description: "Penne pasta tossed in fresh basil pesto, blistered cherry tomatoes, pine nuts, and shaved parmesan.",
          price: "16.50",
          isVeg: true
        },
        {
          id: "item-5",
          name: "Pan-Seared Atlantic Salmon",
          description: "Crispy-skin salmon fillet served over grilled asparagus, roasted fingerling potatoes, and lemon butter sauce.",
          price: "24.00",
          isVeg: false
        },
        {
          id: "item-6",
          name: "The Garden House Burger",
          description: "Prime beef patty, melted cheddar, caramelized onions, butter lettuce, and house sauce on a toasted brioche bun.",
          price: "18.00",
          isVeg: false
        }
      ]
    },
    {
      id: "sec-3",
      name: "Desserts & Drinks",
      items: [
        {
          id: "item-7",
          name: "Warm Chocolate Lava Cake",
          description: "Decadent chocolate cake with a molten center, served with vanilla bean gelato.",
          price: "9.00",
          isVeg: true
        },
        {
          id: "item-8",
          name: "Mint Lime Fizz",
          description: "Fresh muddled mint and lime juice topped with cold-pressed sugarcane syrup and sparkling water.",
          price: "5.50",
          isVeg: true
        },
        {
          id: "item-9",
          name: "Hibiscus Iced Brew",
          description: "Cold-brewed organic hibiscus tea infused with orange peel and cinnamon syrup.",
          price: "5.00",
          isVeg: true
        }
      ]
    }
  ]
};

// Compresses menu object keys to reduce URL/QR length
export function compressMenu(menu) {
  if (!menu) return null;
  return {
    n: menu.restaurantName || "",
    t: menu.theme || "emerald",
    s: (menu.sections || []).map(sec => ({
      i: sec.id,
      n: sec.name,
      m: (sec.items || []).map(item => ({
        i: item.id,
        n: item.name,
        d: item.description,
        p: item.price,
        v: item.isVeg ? 1 : 0
      }))
    }))
  };
}

// Decompresses minified keys back to the full menu object
export function decompressMenu(compressed) {
  if (!compressed) return null;
  return {
    restaurantName: compressed.n || "",
    theme: compressed.t || "emerald",
    sections: (compressed.s || []).map(sec => ({
      id: sec.i || `sec-${Math.random()}`,
      name: sec.n || "",
      items: (sec.m || []).map(item => ({
        id: item.i || `item-${Math.random()}`,
        name: item.n || "",
        description: item.d || "",
        price: item.p || "0.00",
        isVeg: item.v === 1
      }))
    }))
  };
}

// Encodes a menu object into a URL-safe Base64 string
export function encodeMenu(menu) {
  try {
    const compressed = compressMenu(menu);
    const jsonStr = JSON.stringify(compressed);
    // Use encodeURIComponent & unescape to handle multi-byte characters correctly
    const utf8Str = unescape(encodeURIComponent(jsonStr));
    const base64 = btoa(utf8Str);
    // Convert standard base64 to URL-safe base64
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (err) {
    console.error("Error encoding menu data:", err);
    return null;
  }
}

// Decodes a URL-safe Base64 string back into a menu object
export function decodeMenu(encodedStr) {
  if (!encodedStr) return null;
  try {
    // Add padding if missing
    let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const utf8Str = atob(base64);
    const jsonStr = decodeURIComponent(escape(utf8Str));
    const data = JSON.parse(jsonStr);
    
    // Auto-detect format: if it contains 'n' or 's', it's compressed.
    // Otherwise, treat it as the older uncompressed format.
    if (data && (data.n !== undefined || data.s !== undefined)) {
      return decompressMenu(data);
    } else {
      return data;
    }
  } catch (err) {
    console.error("Error decoding menu data:", err);
    return null;
  }
}

