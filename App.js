import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DialogInput from 'react-native-dialog-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from './db';
import * as FileSystem from 'expo-file-system';
import * as Updates from "expo-updates"




export default class App extends React.Component {
  

  state= {
    isDialogVisible:false,
    isDialogVisible2:false,
    reqCreds:0,
    earnedCreds:0,
    Wee1:0,
    Wee2:0,
    Wee3:0,
    Wee4:0,
    Wee5:0,
    Wee6:0,
    Wee7:0,
    Wee8:0,
    Wee9:0,
    Wee10:0,
    curTerm: 1,
    options: [1],
    
  }
  
   componentDidMount = async() =>{
     
      console.log("Mounted");
      this.getCredits();
      try {
        const dataInserted = await AsyncStorage.getItem('dataInserted');

        if (!dataInserted) {
          console.log("newly opened");
          db.transaction((tx) => {
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS Terms (TermId INTEGER PRIMARY KEY AUTOINCREMENT, Week1 INTEGER, Week2 INTEGER, Week3 INTEGER, Week4 INTEGER, Week5 INTEGER, Week6 INTEGER, Week7 INTEGER, Week8 INTEGER, Week9 INTEGER, Week10 INTEGER);'
            );
            tx.executeSql(
              'INSERT INTO Terms (Week1, Week2, Week3, Week4, Week5, Week6, Week7, Week8, Week9, Week10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            );
          });
          await AsyncStorage.setItem('dataInserted', 'true');
        }

        this.getTerms();
      } catch (error) {
        console.error('Error checking or inserting data:', error);
      }
    };
 

    getCredits = async()=>{
      try{
        let tempReq = await AsyncStorage.getItem("Required");
        let tempEarned = await AsyncStorage.getItem("Earned");
        
        let tempCur = parseInt(await AsyncStorage.getItem("curTerm")) || 1;
 
        if(tempReq !== null){
          this.setState({reqCreds: parseInt(tempReq), earnedCreds:parseInt(tempEarned), curTerm: parseInt(tempCur)});
          this.getWeeksFromTable(this.state.curTerm); 
        }
        else{
          console.log("here");
          this.setState({isDialogVisible:true});
        }
      }
      catch(err){
        alert(err);
      } 
    }

    //handles the first set of input data
    firstDiag= async(txt)=>{
      if(txt !== "" && txt != null){
        await AsyncStorage.setItem("Required", txt);
        this.setState({isDialogVisible:false, reqCreds:txt, isDialogVisible2:true});
      }
      else{
        console.log("blank input");
      }
    }

    //handles the second set of input data
    secondDiag = async(txt) =>{
      if(txt !== "" && txt != null){
        await AsyncStorage.setItem("Earned", txt); 
        this.setState({isDialogVisible2:false, earnedCreds:txt}); 
      }
      else{
        console.log("blank input");
      }
    }

 
  
  addCred = async()=>{
    await AsyncStorage.setItem("Earned", String(parseInt(this.state.earnedCreds) + 1));
    this.getCredits();
  }

  addCredToWeek = async(weekNum)=>{

    if(!isNaN(this.state.curTerm)){
      if(this.state.earnedCreds < this.state.reqCreds){
        const weekNumber = 'Wee' + weekNum;
        const tempNum = this.state[`${weekNumber}`];
        const newNum = parseInt(tempNum) + 1;
        this.setState({[weekNumber]: newNum});

        tempTotal = parseInt(this.state.earnedCreds) + 1;
        this.setState({earnedCreds:tempTotal});
        await AsyncStorage.setItem("Earned", String(this.state.earnedCreds));
        this.modifyTerm(this.state.curTerm);
      }
      else{
        console.log("cant add" + this.state.earnedCreds);
        console.log(this.state.reqCreds); 
      } 
  }
  }
 
  removeCredToWeek = async(weekNum)=>{ 
    if(!isNaN(this.state.curTerm) ){
      const weekNumber = 'Wee' + weekNum;
      const tempNum = this.state[`${weekNumber}`];
      if(parseInt(tempNum) !== 0 && parseInt(this.state.earnedCreds) !== 0){
        let newNum = parseInt(tempNum) - 1;
        this.setState({[weekNumber]: newNum});
        tempTotal = parseInt(this.state.earnedCreds) - 1;
        this.setState({earnedCreds:tempTotal});
        await AsyncStorage.setItem("Earned", String(this.state.earnedCreds));
        this.modifyTerm(this.state.curTerm); 
      }
  }
  }

  sqlFun = () => {
    console.log("sql");
    db.transaction((tx) => {
      try {
        tx.executeSql('SELECT * FROM Terms;', [], (_, { rows }) => {
          const tableData = rows._array;
          console.log(tableData);
        });
      } catch (error) {
        console.error(error);
      }
    });
  };

  resetFun = async()=>{
    console.log("RESET");
    this.setState({reqCreds:0, earnedCreds:0, isDialogVisible:true, isDialogVisible2:false,Wee1:0,Wee2:0,Wee3:0,Wee4:0,Wee5:0,Wee6:0,Wee7:0,Wee8:0,Wee9:0,Wee10:0, options:[1]});
    await AsyncStorage.removeItem("Required");
    await AsyncStorage.removeItem("Earned");
    await AsyncStorage.removeItem("curTerm"); 
    await AsyncStorage.removeItem("dataInserted");
    this.sqlDel();
    Updates.reloadAsync();
  } 

  sqlDel = async()=>{
    try {
      db._db.close();
      const documentDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const dbUri = `${documentDirectory}SQLite/Terms.db`;
      await FileSystem.deleteAsync(dbUri);
      console.log('Database file deleted successfully.');
    } catch (error) {
      console.error('Error deleting the database file:', error);
    }
  }

  addTerm = () => {
    try{
    db.transaction((tx) => {
      try {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS Terms (TermId INTEGER PRIMARY KEY AUTOINCREMENT, Week1 INTEGER, Week2 INTEGER, Week3 INTEGER, Week4 INTEGER, Week5 INTEGER, Week6 INTEGER, Week7 INTEGER, Week8 INTEGER, Week9 INTEGER, Week10 INTEGER);'
        );
        console.log("adding");
        tx.executeSql(
          'INSERT INTO Terms (Week1, Week2, Week3, Week4, Week5, Week6, Week7, Week8, Week9, Week10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        );

        Alert.alert("Term Successfully Added");
      } catch (error) {
        console.error(error);
      }
    }); 
  } catch (er){
    console.error(er);
  }
  try{
    this.getTerms();
  } catch(errr){
    console.error(errr);
  }
    
  } 

   getAllTermIds = () => { 
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT TermId FROM Terms;',
          [],
          (tx, result) => {
            const termIds = [];
            for (let i = 0; i < result.rows.length; i++) {
              termIds.push(result.rows.item(i).TermId);
            }
            resolve(termIds);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }); 
    });
  }

  getTerms = ()=>{
    this.getAllTermIds()
  .then((termIds) => {
   this.setState({options:termIds});
  })
  .catch((error) => {
    console.error('Error retrieving TermIds:', error);
  });
  }


  setSelectedValue = async(inp)=>{
    console.log('pressed');
    this.setState({curTerm:parseInt(inp)});
    await AsyncStorage.setItem("curTerm", String(inp));
    this.getWeeksFromTable(this.state.curTerm);
  }

  getWeeksFromTable = (termId)=>{
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT Week1, Week2, Week3, Week4, Week5, Week6, Week7, Week8, Week9, Week10 FROM Terms WHERE TermId = ${termId} ;`,
        [],
        (_, { rows }) => {
          const { _array } = rows;
          if (_array.length > 0) {
            const { Week1, Week2, Week3, Week4, Week5, Week6, Week7, Week8, Week9, Week10 } = _array[0];
            this.setState({Wee1: Week1, Wee2: Week2, Wee3: Week3, Wee4: Week4, Wee5: Week5,Wee6: Week6,Wee7: Week7,Wee8: Week8,Wee9: Week9,Wee10: Week10});
          }
        }
      );
    });
  }

  modifyTerm = (termId) => {
    db.transaction((tx) => {
      try {
        tx.executeSql(
          `UPDATE Terms SET Week1 = ?, Week2 = ?, Week3 = ?, Week4 = ?, Week5 = ?, Week6 = ?, Week7 = ?, Week8 = ?, Week9 = ?, Week10 = ? WHERE TermId = ${termId};`,
          [this.state.Wee1, this.state.Wee2, this.state.Wee3, this.state.Wee4, this.state.Wee5, this.state.Wee6, this.state.Wee7, this.state.Wee8, this.state.Wee9, this.state.Wee10]
        );
      } catch (error) { 
        console.error(error);
      }
    });
  }


   twoOptionAlertHandler = () => {
    console.log("no term cur term : " + this.state.curTerm);
    console.log(this.state.options);
    if(this.state.options.length<1){
      console.log(this.state.options);
    }
    else{

  
    Alert.alert(
      'Delete current term?',
      'Are you sure that you want to delete term #' + this.state.curTerm +" ?",
      [
        { text: 'Yes', onPress: () => this.removeTerm(this.state.curTerm) },
        {
          text: 'No',
          onPress: () => console.log('No Pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
    }
  }

  twoOptionAlertHandler2 = () => {
    Alert.alert(
      'Reset ALL data??',
      'Are you sure that you want to delete all of the data on this app? (restarting the app after confirming might be required.)',
      [
        { text: 'Yes', onPress: () => this.resetFun() },
        {
          text: 'No',
          onPress: () => console.log('No Pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
    
  }

  refundCreds = async(num)=>{
    await AsyncStorage.setItem("Earned", String(parseInt(this.state.earnedCreds) - num));
    this.getCredits();
  }

  removeTerm = (termId) => {
    //credits earned gets reduced by amount in the week being removed
    let refund = this.state.Wee1 + this.state.Wee2 + this.state.Wee3 +this.state.Wee4 +this.state.Wee5+this.state.Wee6+this.state.Wee7+this.state.Wee8+this.state.Wee9+this.state.Wee10;
    this.refundCreds(refund);

    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM Terms WHERE TermId = ?;`,
        [termId],
        () => {
          console.log('Term deleted successfully.');
         
          this.updateCurTerm(); 
        }, 
        (error) => {
          console.error(error);
        }
      );
    });
  } 

  updateCurTerm = ()=>{
    this.getAllTermIds()
    .then(async(termIds) => {
     this.setState({options:termIds});
     let temp = this.state.options[0];
    if(temp){
      await AsyncStorage.setItem("curTerm", String(temp));
      this.setState({curTerm: temp});
      this.getWeeksFromTable(temp);
    }
    else{
      await AsyncStorage.setItem("curTerm", "1");
      this.setState({curTerm: 1});  
    }
    })
    .catch((error) => {
      console.error('Error retrieving TermIds:', error);
    });
  }


 
  

  render(){
  return (
    <View style={styles.container}>

      <DialogInput isDialogVisible={this.state.isDialogVisible}
            title={"Required Credits"}
            message={"How many credits are required for your degree?"}
            hintInput ={"0-180"}
            submitInput={ (inputText) => {this.firstDiag(inputText)} }
            closeDialog={ () => {console.log("")}}
           >
      </DialogInput>
      <DialogInput isDialogVisible={this.state.isDialogVisible2}
            title={"Completed Credits"}
            message={"How many credits have you completed so far?"}
            hintInput ={"0-180"}
            submitInput={ (inputText) => {this.secondDiag(inputText)} }
            closeDialog={ () => {console.log("")}}
           >
      </DialogInput>

    

<View style = {{marginTop:30, marginBottom:10, width:'100%',alignContent:'center', textAlign:'center',alignItems:'center', justifyContent:'center', flexDirection:'row' }}>
<TouchableOpacity style={{marginRight:20}} onPress={this.twoOptionAlertHandler}><Text style={{fontSize:50, color:'white'}}> - </Text></TouchableOpacity>
  
  <Picker
    selectedValue={this.state.curTerm}
    onValueChange={(itemValue) => this.setSelectedValue(itemValue)}
    
    style={{ height: 50, width: '50%', color:'white' }}
    
  >
    {this.state.options.map((option) => (
      <Picker.Item
        key={option} 
        label={"Term: " + option.toString()}
        value={option}
        style={{fontSize:20}}
      />
    ))} 
  </Picker>
  <TouchableOpacity style={{marginLeft:20}} onPress={this.addTerm}><Text style={{fontSize:50, color:'white',}}>+</Text></TouchableOpacity>
</View>
<View style ={styles.infoContainer}>
      <Text style = {{fontSize:25, color:'white'}}>{this.state.earnedCreds}/{this.state.reqCreds} Credits</Text>
      <Text style = {{fontSize:25 , color:'white'}}>{this.state.reqCreds - this.state.earnedCreds} Remaining</Text>
      </View>
      <ScrollView style={{width:'100%'}}>

        <View style={{width:'100%',justifyContent:'center', textAlign:'center', alignContent:'center', alignItems:'center'}}>
          <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 1|</Text>
            <TouchableOpacity onPress={()=> this.removeCredToWeek('1')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee1}</Text>
            <TouchableOpacity onPress={()=> this.addCredToWeek('1')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 2|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('2')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee2}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('2')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 3|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('3')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee3}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('3')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 4|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('4')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee4}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('4')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 5|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('5')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee5}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('5')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 6|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('6')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee6}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('6')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 7|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('7')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee7}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('7')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 8|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('8')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee8}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('8')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 9|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('9')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee9}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('9')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        

        <View style={styles.weekContainer}>
            <Text style={styles.weekWord}>Week 10|</Text>
            <TouchableOpacity onPress={ ()=> this.removeCredToWeek('10')}><Text style={styles.firstArrow}>-</Text></TouchableOpacity>
            <Text style={styles.secondArrow}>{this.state.Wee10}</Text>
            <TouchableOpacity onPress={ ()=> this.addCredToWeek('10')}><Text style={styles.secondArrow}>+</Text></TouchableOpacity>
          </View>
        
<View style={{marginBottom:40}}></View>
      
      <TouchableOpacity style={styles.weekContainer} onPress={this.twoOptionAlertHandler2}><Text style={styles.weekWord}>RESET ALL</Text></TouchableOpacity>
      <View style={{marginBottom:40}}></View>
      </View>
      </ScrollView>
       
      <StatusBar style="auto" />
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#412daa',
    alignItems: 'center',
    justifyContent: 'center',

  },
  weekContainer:{
    flexDirection:'row', 
    justifyContent:'center',
    marginTop:20, 
    alignItems:'center', 
    backgroundColor: '#4d4bc9', 
    borderRadius: 20, 
    width: '90%', 
    shadowColor:'#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation:20,
  },
  infoContainer:{
    justifyContent:'center',
    marginTop:20, 
    paddingTop:10,
    paddingBottom:10,
    alignItems:'center', 
    backgroundColor: 'black', 
    borderBottomColor:'white',
    borderTopColor:'white',
    borderWidth:2,
    width: '100%', 
    shadowColor:'#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation:20,
  },
  infoContainer2:{ 
    justifyContent:'center',
    marginTop:20, 
    alignItems:'center', 
    backgroundColor: '#4d4bc9', 
    borderRadius: 20, 
    width: '60%', 
    shadowColor:'#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation:20,
  },
  weekWord:{
    fontSize:30,
    marginLeft:20,
    color:'white',
  },
  firstArrow: {
    fontSize:50, marginLeft:60, marginRight:20, color:'white'
  },
  secondArrow: {
    fontSize:50,
    marginRight:20,
    color:'white',
  },
  line:{
    width:'100%',height:1, backgroundColor:'black'
  },
});
