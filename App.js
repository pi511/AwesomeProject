import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text , View, Picker } from 'react-native';
import Cheerio from 'react-native-cheerio';
import HTMLParser from 'react-native-html-parser';


const HelloworldApp = () => {

  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const [url, setUrl] = useState('https://www.aksandik.org/anlasmali-kurumlar');
  const ilceUrl = 'https://www.aksandik.org/ajax/ilceler/';
  const [loading, setLoading] = useState(true);
  const [cookie, setCookie] = useState();
  const [tip, setTip] = useState();
  const [il, setIl] = useState();
  const [ilce, setIlce] = useState();
  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml',
    'Accept-Encoding': 'gzip, deflate, br',
    'x-requested-with': 'none',
  };


  const [tipH, setTipH] = useState('');
  const [ilH, setIlH] = useState('');
  const [ilceH, setIlceH] = useState('');

  const tipSecildi = (v) => {
    setTip(v);
  }
  const ilSecildi = (v) => {
    setIl(v);
    console.log(ilceUrl + v);
    const jheaders = {...headers, Accept: 'application/json, text/javascript, */*'};
    fetch(proxyUrl + ilceUrl + v, {method: 'GET', cookie: cookie, headers: jheaders})
    .then((res)=>{
      console.log(res);
      const decoder = new TextDecoder('utf-8');
      let ab = '';
      res.arrayBuffer().then((a) => {
        ab = a; console.log("a=", a);
          let jsonString = decoder.decode(ab, { stream: false });
          let jsIlce = JSON.parse(jsonString);
          console.log("json=", jsonString)
          console.log(jsIlce[0])
          let htmlString = '';
          jsIlce.map((i)=>{
            htmlString += '<option value=' + i.id + '>'+ i.adi + '</option>'
          });
          setIlceH(htmlString);
      });
    });
  }

  //'https://www.aksandik.org/anlasmali-kurumlar?kurum_tipi=15&il=6&ilce=1088'

  const ilceSecildi = (v) => {
    setIlce(v);
    console.log(ilceUrl + '/' + v);
    let _url = proxyUrl + url + '?kurum_tipi=' + tip + '&il=' + il + '&ilce=' + v; 
    let next = true;
    let currentpage = 1;
    while(next)
    {
      fetch(_url, {method: 'GET', cookie: cookie, headers: headers})
      .then((res)=>{
        console.log(res);
        const decoder = new TextDecoder('utf-8');
        let ab = '';
        res.arrayBuffer().then((a) => {
          ab = a; console.log("a=", a);
          let htmlString = decoder.decode(ab, { stream: false });
          console.log(_url);
          const $ = Cheerio.load(htmlString);
          let tbody_html = $('table.table tbody');
          if (tbody_html.length > 0) {
            //console.log("tablo=", tbody_html)
            const rows = tbody_html.find('tr').map((index, element) => {
              const row = $(element);
              const cells = row.find('td').map((index, element) => $(element).text()).get();
              return cells;
            }).get();
            console.log(rows);
            var nextpage = currentpage;
            const aTag = $('ul.pagination li a').map(function() {
              var pageno = Int16Array.parse($(this).text().trim());
              if (pageno == (currentpage + 1))
              {
                nextpage =  pageno;
                _url = aTag.attr('href');
                console.log(nextpage, _url); // Output: #
              }
            });
            currentpage = nextpage;
          }
          else{
            console.log('tbody element not found');
          }
        });
      });
  
    }
  
  }

  useEffect(() => {
    fetch(proxyUrl + url, {method: 'GET', headers: headers})
    .then((res)=>{
      setLoading(false);
      setCookie(res.headers.get("Set-Cookie"));
})
  }, [loading]);

  useEffect(() => {
    if (loading)
      return;
    fetch(proxyUrl + url, {method: 'GET', cookie: cookie, headers: headers})
    .then((res)=>{
      const decoder = new TextDecoder('utf-8');
      let ab = '';
      res.arrayBuffer().then((a) => {
        ab = a; console.log("a=", a);
          let htmlString = decoder.decode(ab, { stream: false });
          //console.log("k=", htmlString);
          const $ = Cheerio.load(htmlString);
          let tip_html = $('#kurum_tipi').html();
          //tip_html = tip_html.replace(/\"/g, '').replace(/\n\w*/g, '');
          console.log("tip_html= ", tip_html);  
          setTipH(tip_html);
          const il_html = $('#il').html();
          console.log("il_html= ", il_html);  
          setIlH(il_html);
        });
    })
    .catch((e)=> console.log('hata=', e))
  }, [cookie]);

  return (
    <View style={styles.container}>
      <table>
        <tbody>
          <tr><td>
      <label htmlFor="tip" >Tip </label>
        { tipH == '' ? 
          <Picker id="tip" onValueChange={tipSecildi}>
            <Picker.Item label="Option1" value="option1"/>
            <Picker.Item label="Option2" value="option2"/>
          </Picker> :
        <Picker id="tip" onValueChange={tipSecildi} dangerouslySetInnerHTML={ {__html: tipH} }/>
      }
      </td>
      <td>
      <label htmlFor="il" > İl </label>
      { ilH == '' ? 
        <Picker id="il" onValueChange={ilSecildi}>
          <Picker.Item label="Option1" value="option1"/>
          <Picker.Item label="Option2" value="option2"/>
        </Picker>        : 
        <Picker id="il" onValueChange={ilSecildi} dangerouslySetInnerHTML={ {__html: ilH} }/>
      }
      </td>
      <td>
      { ilceH == '' ? 
        <Picker id="ilce" onValueChange={ilceSecildi}>
          <Picker.Item label="Option1" value="option1"/>
          <Picker.Item label="Option2" value="option2"/>
        </Picker>        : 
        <Picker id="ilce" onValueChange={ilceSecildi} dangerouslySetInnerHTML={ {__html: ilceH} }/>
      }
      </td>
      </tr>
      </tbody>
      </table>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    button: {
    alignItems: 'center',
    backgroundColor: '#3DD3DD',
    padding: 10,
    marginBottom: 10,
  },
});

export default HelloworldApp;
