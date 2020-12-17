import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lodash from 'lodash';
import GroupsHelper from '../helper/GroupsHelper';
import { ContactModel } from '../model/ContactModel';
import UpdateContactHelper from '../helper/UpdateContactHelper';

const EditContactScreen = ({ route, navigation }) => {
  const [data, setData] = useState(new ContactModel(null));
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    initData();
  }, [route]);

  const initData = async () => {
    let groups = await GroupsHelper.getGroups();
    setGroups(groups);
    if (route.params && route.params.data) {
      const contact = route.params.data;
      setData(contact);
      groups.forEach((item) => {
        if (item.id === contact.group) {
          setSelectedGroup(item.id);
        }
      });
    }
  };

  const addFriend = async () => {
    let data = [];
    try {
      const userInfo = await AsyncStorage.getItem('@userInfo');
      const user = JSON.parse(userInfo)
      const contact = route.params.data;
      let response = await fetch(
        'http://172.17.100.14/public-api/notify/sendrequest', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "type": 1,
            "employee_id_source": user.id,
            "employee_id_member": [contact.id]
          })
        }
      );
      if (response?.status == 200) {
        Alert.alert("Gửi yêu cầu thành công");
        updateFriendStatus()
      }
    } catch (error) {
      console.log(error)
    }
    return data;
  }

  const updateFriendStatus = async() => {
    try {
      const value = await AsyncStorage.getItem('@contact');
      const data = JSON.parse(value);
      data.map((item) => {
        if (item?.id == route?.params?.data?.id) {
          item.requestStatus = 1;
          return;
        }
      });
      await AsyncStorage.setItem('@contact', JSON.stringify(data));
    } catch (e) {
      console.log('FetchContactHelper getContacts error', e);
    }
  }

  const updateContact = useCallback(async () => {
    try {
      const response = await UpdateContactHelper.updateContact(data);
      if (response) {
        alert('Update Contact Successfully.');
      } else {
        alert('Update Contact Fail.');
      }
    } catch (error) {
      alert('Have trouble when update contact.');
      console.log('ERROR', error);
    }
  }, [data]);

  const changeGroup = useCallback(
    (item) => {
      console.log('xxxxxx', item, data);
      if (item) {
        if (data.group === item.id) {
          data.group = null;
          setSelectedGroup(null);
        } else {
          data.group = item.id;
          setSelectedGroup(item.id);
        }
        setData(data);
      }
    },
    [data],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50, backgroundColor: '#FF7951' }}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            marginLeft: 16
          }}
          onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white', fontSize: 18 }}>
            Back
        </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: 'white',
          paddingTop: 15,
          paddingHorizontal: 15,
        }}>
        <View style={{ marginVertical: 5 }} key={0}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>ID</Text>
          <Text>{data?.id}</Text>
        </View>
        <View style={{ marginVertical: 5 }} key={0}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Họ và Tên</Text>
          <Text>{data?.name}</Text>
        </View>
        <View style={{ marginVertical: 5 }} key={0}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Chức vụ</Text>
          <Text>{data?.jobtitle}</Text>
        </View>
        {
          data?.email ? <View style={{ marginVertical: 5 }} key={0}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Email</Text>
            <Text>{data?.email}</Text>
          </View> : <View />
        }
        {
          data?.friends && data?.phone ? <View style={{ marginVertical: 5 }} key={0}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Số điện thoại</Text>
            <Text>{data?.phone}</Text>
          </View> : <View />
        }
        <View style={{ marginVertical: 5 }} key={4}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm</Text>
          <FlatList
            style={{ marginVertical: 5 }}
            data={groups}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.value}
                style={{
                  marginVertical: 5,
                  marginHorizontal: 5,
                  flexDirection: 'row',
                }}
                onPress={() => changeGroup(item)}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor:
                      item.id === selectedGroup ? '#FF7951' : 'gray',
                  }}
                />
                <Text style={{ marginHorizontal: 5 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 40,
              backgroundColor: '#FF7951',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: 8,
            }}
            onPress={updateContact}>
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              height: 40,
              backgroundColor: 'gray',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: 8,
              marginLeft: 12
            }}
            onPress={() => {
              if (data?.requestStatus == 0) {
                addFriend()
              }
            }}>
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
              {data?.requestStatus == 0 ? 'Thêm bạn' : 'Đã gửi yêu cầu'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditContactScreen;
