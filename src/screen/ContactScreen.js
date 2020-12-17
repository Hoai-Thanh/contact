import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SectionList } from 'react-native';
import SearchBar from 'react-native-search-bar';
import FetchContactHelper from '../helper/FetchContactHelper';
import GroupsHelper from '../helper/GroupsHelper';
import { useIsFocused } from '@react-navigation/native';

const ContactScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const contactsData = useRef([]);
  const [search, setSearch] = useState('');
  const search1 = useRef();
  const isFocused = useIsFocused();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    FetchContactHelper.getGroups();
  }, []);

  useEffect(() => {
    if (isFocused) {
      if (search) {
        searchContact();
      } else {
        initData();
      }
    }
  }, [search, navigation, isFocused]);

  useEffect(() => {
    initDataGroup();
  }, []);

  const initDataGroup = async () => {
    let groups = await GroupsHelper.getGroups();
    setGroups(groups);
  };

  const initData = async () => {
    const contactInPhone = await FetchContactHelper.getContacts();
    if (contactInPhone) {
      contactsData.current = contactInPhone;
      setData(FetchContactHelper.groupAlphabetContact(contactInPhone));
    }
  };

  const searchContact = useCallback(() => {
    console.log('searchContact---->', search);
    const contactInPhone = contactsData.current;
    if (contactInPhone) {
      const filterData = FetchContactHelper.filterContacts(
        search,
        contactInPhone,
      );
      console.log('FetchContactHelper.filterContacts filterData', filterData);
      if (filterData) {
        const groupedData = FetchContactHelper.groupAlphabetContact(filterData);
        setData(groupedData);
      } else {
        setData(contactInPhone);
      }
    } else {
      setData(contactInPhone);
    }
  }, [search]);

  const goGroup = useCallback(() => {
    navigation.push('GroupsScreen');
  }, []);

  const goToEditContactScreen = useCallback((data) => {
    navigation.navigate('EditContactScreen', { data: data });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', margin: 8, height: 40}}>
        <View style={{ flex: 5 }}>
          <SearchBar
            ref={search1}
            textColor="black"
            placeholder="Search"
            onChangeText={setSearch}
          />
        </View>
        <View style={{ flex: 2 }}>
          <TouchableOpacity style={{ height: 40, backgroundColor: '#FF7951', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }} onPress={goGroup}>
            <Text style={{fontSize: 16, marginLeft: 3, marginRight: 3, color: 'white'}}>Nhóm</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 3, marginLeft: 8 }}>
          <TouchableOpacity style={{ height: 40, backgroundColor: '#FF7951', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }} onPress={goGroup}>
            <Text style={{fontSize: 16, marginLeft: 3, marginRight: 3, color: 'white'}}>Thông báo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        style={{ flex: 1 }}
        sections={data}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={{
              padding: 10,
              backgroundColor: 'gray',
              color: 'white',
              fontSize: 16,
            }}>
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              marginVertical: 5,
              marginHorizontal: 10,
              alignItems: 'center',
            }}
            key={item?.id}
            onPress={() => goToEditContactScreen(item)}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'orange',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 8
              }}>
              <Text style={{ color: 'white', fontSize: 18 }}>
                {item?.shortFullName}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 20, marginHorizontal: 5 }}>
                ID: {item?.id}
              </Text>
              <Text style={{ fontSize: 20, marginHorizontal: 5 }}>
                Họ và Tên: {item?.fullName}
              </Text>
              <Text style={{ fontSize: 20, marginHorizontal: 5 }}>
                Chức vụ: {item?.jobtitle}
              </Text>
              {
                item?.email ? <Text style={{ fontSize: 20, marginHorizontal: 5 }}>
                  Email: {item?.email}
                </Text> : <View />
              }
              {
                item?.friend && item?.phone ? <Text style={{ fontSize: 20, marginHorizontal: 5 }}>
                  Số dt: {item?.phone}
                </Text> : <View />
              }
              {
                item.groupName ? <Text style={{ fontSize: 20, marginHorizontal: 5 }}>
                  Nhóm: {item?.groupName}
                </Text> : <View />
              }
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index}
        ItemSeparatorComponent={() => (
          <View style={{ height: 0.3, backgroundColor: 'gray' }} />
        )}
      />
    </View>
  );
};

export default ContactScreen;
