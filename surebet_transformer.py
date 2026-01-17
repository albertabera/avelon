import re
from datetime import datetime

def transform_surebet_text(text):
    if "New surebet found!" not in text:
        return text

    try:
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        
        # Data storage
        data = {
            'profit': None,
            'sport': None,
            'league': None,
            'event': None,
            'date': None,
            'bookies': []
        }
        
        # Regex patterns
        profit_re = re.compile(r"Profit:\s*([\d\.]+)%")
        sport_re = re.compile(r"Sport:\s*(.+)")
        league_re = re.compile(r"League:\s*(.+)")
        event_re = re.compile(r"Event:\s*(.+)")
        start_re = re.compile(r"Start at\s*:\s*(.+)")
        
        # Parsing Header
        current_line_idx = 0
        for i, line in enumerate(lines):
            if profit_re.search(line):
                data['profit'] = profit_re.search(line).group(1)
            elif sport_re.search(line):
                data['sport'] = sport_re.search(line).group(1)
            elif league_re.search(line):
                data['league'] = league_re.search(line).group(1)
            elif event_re.search(line):
                data['event'] = event_re.search(line).group(1)
            elif start_re.search(line):
                raw_date = start_re.search(line).group(1)
                data['date'] = parse_date(raw_date)
                current_line_idx = i + 1
                break
        
        # Parsing Bookies
        # Remaining lines should be bookie blocks
        # Example block:
        # Bet365ES:
        # ▫️TO(174.5) → 3.0
        # ▫️Stake: 35.62 $ Place Bet (url)
        
        current_bookie = None
        
        for i in range(current_line_idx, len(lines)):
            line = lines[i]
            if line.endswith(':'): # New Bookie
                if current_bookie:
                    data['bookies'].append(current_bookie)
                current_bookie = {
                    'name': line.replace(':', ''),
                    'market': '',
                    'odds': '',
                    'stake': '',
                    'link': ''
                }
            elif line.startswith('▫️') and current_bookie is not None:
                content = line.replace('▫️', '').strip()
                if '→' in content: # Market and Odds
                    parts = content.split('→')
                    current_bookie['market'] = parts[0].strip()
                    current_bookie['odds'] = parts[1].strip()
                elif 'Stake:' in content: # Stake and Link
                    # Format: Stake: 35.62 $ Place Bet (url)
                    # Or: Stake: 64.38 $
                    stake_match = re.search(r"Stake:\s*([\d\.]+)\s*\$", content)
                    if stake_match:
                        current_bookie['stake'] = float(stake_match.group(1))
                    
                    if 'http' in content:
                        link_match = re.search(r"\((http.+)\)", content)
                        if link_match:
                            current_bookie['link'] = link_match.group(1)

        # Append last bookie
        if current_bookie:
            data['bookies'].append(current_bookie)
            
        # Calculate Percentage Stake
        total_stake = sum(b['stake'] for b in data['bookies'] if isinstance(b['stake'], (int, float)))
        for b in data['bookies']:
            if isinstance(b['stake'], (int, float)) and total_stake > 0:
                b['percent'] = (b['stake'] / total_stake) * 100
            else:
                b['percent'] = 0

        # Construct Output
        output = []
        output.append("📢 ALERTA DE SUREBETS (SIN RIESGO)\n")
        output.append("1️⃣ 🔥 -- SURESTABERA -- 🔥")
        output.append(f"📈 PROFIT: {data['profit']}%\n")
        
        # Sport (Translate if needed, for now keep original or simple mapping)
        sport_map = {'Basketball': 'Baloncesto', 'Soccer': 'Fútbol', 'Football': 'Fútbol'}
        sport_display = sport_map.get(data['sport'], data['sport'])
        output.append(f"⚽️ Deporte: {sport_display}")
        
        output.append(f"📆 Fecha: {data['date']}")
        output.append(f"🏆 Partido: {data['event']}\n")
        
        # Bookie mapping for URLs if missing
        default_urls = {
            'LeovegasES': 'https://www.leovegas.es/',
            'BetssonES': 'https://www.betsson.es/',
            'Bet365ES': 'https://www.bet365.es/'
        }
        
        for idx, bookie in enumerate(data['bookies'], 1):
            name_display = bookie['name']
            # Clean name (remove ES suffix for display maybe?)
            if name_display.endswith('ES'):
                name_display = name_display[:-2] + " (ES)"
            
            link = bookie['link']
            if not link:
                link = default_urls.get(bookie['name'], '')
            
            output.append(f"🏦 Casa {idx}: {name_display} ({link})")
            
            # Market formatting: "TO(174.5)" -> "Total superior a 174.5" ?
            # User example: "Total superior a 1.5 - fueras de juego equipo FC St. Pauli"
            # Input: "TO(174.5)"
            market_text = bookie['market']
            market_text = market_text.replace("TO", "Total superior a ").replace("TU", "Total inferior a ")
            
            output.append(f"   🎯 Mercado: {market_text}")
            output.append(f"   📊 Cuota: {bookie['odds']}")
            output.append(f"   💰 % Stake: {bookie['percent']:.2f}%  \n")
            
        return "\n".join(output)

    except Exception as e:
        return f"Error transforming message: {str(e)}\n\nOriginal Message:\n{text}"

def parse_date(date_str):
    # Input: 22 Dec 00:00 UTC
    # Output: 21/12 15:30 (User wants DD/MM HH:MM)
    try:
        # constant year for now
        year = datetime.now().year
        # Remove UTC and extra spaces
        clean_str = date_str.replace("UTC", "").strip()
        # Parse "22 Dec 00:00"
        dt = datetime.strptime(f"{clean_str} {year}", "%d %b %H:%M %Y")
        return dt.strftime("%d/%m %H:%M")
    except:
        return date_str

if __name__ == "__main__":
    input_msg = """💰 New surebet found!
Profit: 6.87%
Sport: Basketball
League: USA. NCAA
Event: Cal Poly SLO - Idaho Vandals [Full time with overtimes]
Start at : 22 Dec 00:00 UTC      

Bet365ES:
▫️TO(174.5) → 3.0
▫️Stake: 35.62 $ Place Bet (https://www.bet365.es/dl/sportsbookredirect/?bs=24544825-224963434~2/1&bet=1#/IP//AC/B18/C21097732/D19/E24544825/F19/)
LeovegasES:
▫️TU(174.5) → 1.66
▫️Stake: 64.38 $"""

    print("Original:")
    print(input_msg)
    print("-" * 20)
    print("Transformed:")
    print(transform_surebet_text(input_msg))
