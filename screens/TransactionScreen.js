import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet, TextInput, Image, Alert, KeyboardAvoidingView, ToastAndroid} from 'react-native'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import firebase from 'firebase'
import db from '../config'
export default class TransactionScreen extends React.Component{

    constructor(){
        super()
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedBookId:'',
            scannedStudentId:'',
            buttonState:'normal',
            transactionMessage:'',
        }
    }


handleBarCodeScanned=async({type,data})=>{
    const buttonState=this.state.buttonState
    if (buttonState === 'BookId'){
        this.setState({
            scanned:true,
            scannedBookId:data,
            buttonState:'normal'
        })
    }
    else if (buttonState === 'StudentId'){
        this.setState({
            scanned:true,
            scannedStudentId:data,
            buttonState:'normal'
        })
    }

    }

    getCameraPermissions=async(id)=>{
      const {status}=await Permissions.askAsync(Permissions.CAMERA)
      this.setState({
          hasCameraPermissions:status==='granted',
          buttonState:id,
          scanned:false
      })  
    }

    handleTransaction=async()=>{
    var transactionType=await this.checkBookEligibility()
    if (!transactionType){
        Alert.alert('This book does not exist in the database')
        this.setState({
            scannedStudentId:'',
            scannedBookId:'',
        })
    }

    else if (transactionType==='Issue'){
        var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
        if(isStudentEligible){this.initiateBookIssue()
        Alert.alert('Book Issued')
        }
    }

    else {
        var isStudentEligible=await this.checkStudentEligibilityForBookReturn()
        if(isStudentEligible){this.initiateBookReturn()
        Alert.alert('Book Returned')
        }
    }
}

checkBookEligibility=async()=>{
    const bookRef=await db.collection('books')
    .where('bookId','==',this.state.scannedBookId).get()
    var transactionType=''
    if (bookRef.docs.length==0){
        transactionType=false
    }
    
    else{bookRef.docs.map(doc=>{
        var book=doc.data()

        if (book.bookAvailability){
            transactionType='Issue'
        }

        else {
            transactionType='Return'
        }
    })}

    return transactionType

}

    checkStudentEligibilityForBookIssue=async()=>{
        const studentRef=await db.collection('students')
        .where('studentId','==',this.state.scannedStudentId).get()
        var isStudentEligible=''
        
        if (studentRef.docs.length==0){
            isStudentEligible=false
            Alert.alert('This Id does not exist in the database')
            this.setState({
                scannedStudentId:'',
                scannedBookId:'',
            })
        }
        
        else{studentRef.docs.map(doc=>{
            var student=doc.data()
    
            if (student.numberOfBooksIssued<2){
                isStudentEligible=true
            }
    
            else {
                isStudentEligible=false

                Alert.alert('You have Issued more than 2 Books')
            this.setState({
                scannedStudentId:'',
                scannedBookId:'',
            })
            }
        })}

        return isStudentEligible
    }

    checkStudentEligibilityForBookReturn=async()=>{
        const transactionRef=await db.collection('transactions')
        .where('bookId','==',this.state.scannedBookId).limit(1).get()
        var isStudentEligible=''
        
        
        
        transactionRef.docs.map(doc=>{
            var lastBookTransaction=doc.data()
    
            if (lastBookTransaction.studentId===this.state.studentId){
                isStudentEligible=true
                
            }
    
            else {
                isStudentEligible=false

                Alert.alert('You have not Issued this Book')
            this.setState({
                scannedStudentId:'',
                scannedBookId:'',
            })
            }
        }
        )

        return isStudentEligible
    }

initiateBookIssue=async()=>{
 //adding transaction to database
    db.collection('transaction')
    .add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date':firebase.firestore.Timestamp.now().toDate(),
        'tansactionType':'Issue'
    })

//change the book availability status
db.collection('books').doc(this.state.scannedBookId).update({
    'bookAvailability':false
})

//change the number of books issued status
db.collection('students').doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
})

this.setState({
    scannedStudentId:'',
    scannedBookId:'',
})

}

initiateBookReturn=async()=>{
    //adding transaction to database
       db.collection('transaction')
       .add({
           'studentId':this.state.scannedStudentId,
           'bookId':this.state.scannedBookId,
           'date':firebase.firestore.Timestamp.now().toDate(),
           'tansactionType':'Return'
       })
   
   //change the book availability status
   db.collection('books').doc(this.state.scannedBookId).update({
       'bookAvailability':true
   })
   
   //change the number of books issued status
   db.collection('students').doc(this.state.scannedStudentId).update({
       'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
   })
   
   this.setState({
       scannedStudentId:'',
       scannedBookId:'',
   })
   
   }
render(){
    const hasCameraPermissions=this.state.hasCameraPermissions
    const scanned=this.state.scanned
    const buttonState=this.state.buttonState
    if (buttonState!=='normal' && hasCameraPermissions) {
        return(
            <BarCodeScanner style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
            />
        )
    }
    else if (buttonState==='normal'){
        return(
            <KeyboardAvoidingView 
            style={{justifyContent:'center',
             alignItems:'center', flex: 1, }}
             behavior='padding'
             enabled
             >
                <View>
                <Image
                     style={{width:200,height:200}}
                    source={require('../assets/booklogo.jpg')}
                />
                <Text style={{fontSize:30, textAlign:'center'}}>Willy</Text>
                </View>

                <View style={styles.inputView}>

                    <TextInput 
                    style={styles.inputBox} 
                    placeholder='Book ID'
                    value={this.state.scannedBookId}
                    onChangeText={text=>this.setState({scannedBookId:text})}
                    />

                    <TouchableOpacity 
                    style={styles.scanButton}
                    onPress={()=>{
                        this.getCameraPermissions('BookId')
                    }}
                    >
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                    
                </View>

                <View style={styles.inputView}>

                    <TextInput 
                    style={styles.inputBox} 
                    placeholder='Student ID'
                    value={this.state.scannedStudentId}
                    onChangeText={text=>this.setState({
                        scannedStudentId:text
                    })}/>

                    <TouchableOpacity 
                    style={styles.scanButton}
                    onPress={()=>{
                        this.getCameraPermissions('StudentId')
                    }}
                    >
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>

                </View>

                    <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={async()=>{
                        var transactionMessage=await this.handleTransaction()
                    }}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>

            </KeyboardAvoidingView>
            
            )}
        }
        }
const styles = StyleSheet.create({ 
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
    displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
    scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, 
    buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10, textAlignVertical: 'center', }, 
    inputView:{ flexDirection: 'row', margin: 20 }, 
    inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 }, 
    scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 }, 
    submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 }, 
    submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' },

});


