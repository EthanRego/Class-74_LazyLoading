import React from 'react'
import {Text,View,FlatList,TouchableOpacity,TextInput,StyleSheet} from 'react-native'
export default class SearchScreen extends React.Component{
    componentDidMount=async()=>{
        const query=await db.collection('transaction').limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[],
                lastVisibleTransaction:doc
            })
        })
    }

constructor(props){
    super(props)
    this.state={allTransactions:[],
    lastVisibleTransaction:null,
    search:'',
    }

}


fetchMoreTransactions=async()=>{
    var text = this.state.search.toUpperCase()
    var enterText=this.state.search.toUpperCase().split('')
    if(enterText[0].toUpperCase()==='B'){
        const query=await db.collection('transaction').where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc
            })
        })
    }

    else if(enterText[0].toUpperCase()==='S'){
        const query=await db.collection('transaction').where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc
            })
        })
    }
}

searchTransactions=async(text)=>{
    var enterText=text.split('')
    if(enterText[0].toUpperCase()==='B'){
        const query=await db.collection('transaction').where('bookId','==',text).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc
            })
        })
    }

    else if(enterText[0].toUpperCase()==='S'){
        const query=await db.collection('transaction').where('studentId','==',text).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc
            })
        })
    }
}



render(){
    return(
    <View style={styles.container}>
        <View style={styles.searchBar}>

          <TextInput 
          style ={styles.bar} placeholder = "Enter Book Id or Student Id" 
          onChangeText={(text)=>{this.setState({search:text})}}/>

           <TouchableOpacity 
           style = {styles.searchButton} 
           onPress={()=>{this.searchTransactions(this.state.search)}} >
            <Text>Search</Text> 
            </TouchableOpacity> 

        </View>

        <FlatList
        data={this.state.allTransactions}
        renderItem={({item})=>(
            <View style={{borderBottomWidth:2}}>
                <Text>{'Book ID:'+item.bookId}</Text>
                <Text>{'Student ID:'+item.studentId}</Text>
                <Text>{"Date: " + item.date.toDate()}</Text>
                <Text>{"Transaction Type: " + item.transactionType}</Text>                
            </View>
        )}

        keyExtractor= {(item, index)=> index.toString()}
        onEndReached ={this.fetchMoreTransactions}
        onEndReachedThreshold={0.7}
        />


    </View>
)
}
}


const styles = StyleSheet.create({ container: { flex: 1, marginTop: 20 }, 
    searchBar:{ flexDirection:'row',
     height:40, width:'auto', 
     borderWidth:0.5, 
     alignItems:'center', 
     backgroundColor:'lightblue', 
    
    }, 
     bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'blue' } })