import React, { useState, useEffect } from "react";
import { Input, Modal, Form, Select, message, Table, DatePicker } from "antd";
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Layout from "./../components/Layout/Layout";
import Spinner from "./../components/Spinner";
import axios from "axios";
import moment from "moment";
import Analytics from "../components/Analytics";

const { RangePicker } = DatePicker;

const HomePage = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allTransaction, setAllTransaction] = useState([]);
    const [frequency, setFrequency] = useState("7");
    const [selectedDate, setSelectedDate] = useState([]);
    const [type, setType] = useState("all");
    const [viewData, setViewData] = useState("table");
    const [editable, setEditable] = useState(null);

    // Table columns configuration
    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            render: (text) => <span>{moment(text).format("YYYY-MM-DD")}</span>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
        },
        {
            title: "Type",
            dataIndex: "type",
        },
        {
            title: "Category",
            dataIndex: "category",
        },
        {
            title: "Reference",
            dataIndex: "reference",
        },
        {
            title: "Actions",
            render: (text, record) => (
                <div>
                    <EditOutlined onClick={() => {
                        setEditable({
                            ...record,
                            date: moment(record.date).format("YYYY-MM-DD"), // Format date for editable form
                        });
                        setShowModal(true);
                    }} />
                    <DeleteOutlined 
                    className="mx-2" 
                    onClick={() => {
                        handleDelete(record);
                        }}
                        />
                </div>
            ),
        },
    ];

    // Fetch transactions from API
    useEffect(() => {
        const getAllTransactions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user._id) {
                    throw new Error("User not found in localStorage");
                }

                setLoading(true);
                const requestPayload = {
                    userid: user._id,
                    frequency,
                    selectedDate,
                    type,
                };

                console.log("Request Payload:", requestPayload);

                const res = await axios.post("http://localhost:8080/api/v1/transactions/get-transaction", requestPayload);

                const transactionsWithKeys = res.data.map((transaction) => ({
                    ...transaction,
                    key: transaction._id, // Ensure unique key for each transaction
                }));

                setAllTransaction(transactionsWithKeys);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Fetch issue with transaction:", error.response?.data || error.message);
                message.error("Fetch issue with transaction. Please check server logs.");
            }
        };

        getAllTransactions();
    }, [frequency, selectedDate, type]);

    // delete handler
    const handleDelete = async (record) => {
        try {
            setLoading(true)
            await axios.post("/transactions/delete-transaction", {transactionId: record._id})
            setLoading(false)
            message.success('Transaction deleted')
        } catch (error) {
            setLoading(false)
            console.log(error)
            message.error('unable to delete')
        }
    };

    // Handle form submission for adding/editing a transaction
    const handleSubmit = async (values) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            setLoading(true);

            let res;
            if (editable) {
                res = await axios.post("http://localhost:8080/api/v1/transactions/edit-transaction", {
                    payload: {
                        ...values,
                        date: moment(values.date).toISOString(),
                        userid: user._id,
                    },
                    transactionId: editable._id,
                });
                message.success("Transaction updated successfully!");
            } else {
                res = await axios.post("http://localhost:8080/api/v1/transactions/add-transaction", {
                    ...values,
                    date: moment(values.date).toISOString(),
                    userid: user._id,
                });
                message.success("Transaction added successfully!");
            }

            setShowModal(false);
            setLoading(false);
            setEditable(null);

            setAllTransaction((prevTransactions) => [
                ...prevTransactions,
                { ...res.data, key: res.data._id },
            ]);
        } catch (error) {
            setLoading(false);
            console.error("Error adding transaction:", error.response?.data || error.message);
            message.error("Failed to add transaction. Please check server logs.");
        }
    };

    return (
        <Layout>
            {loading && <Spinner />}
            <div className="filters">
                <div>
                    <h6>Select Frequency</h6>
                    <Select value={frequency} onChange={(value) => setFrequency(value)}>
                        <Select.Option value="7">LAST 1 Week</Select.Option>
                        <Select.Option value="30">LAST 1 Month</Select.Option>
                        <Select.Option value="365">LAST 1 Year</Select.Option>
                        <Select.Option value="custom">Custom</Select.Option>
                    </Select>
                    {frequency === "custom" && (
                        <RangePicker
                            value={selectedDate}
                            onChange={(dates) => setSelectedDate(dates)}
                        />
                    )}
                </div>
                <div>
                    <h6>Select Type</h6>
                    <Select value={type} onChange={(value) => setType(value)}>
                        <Select.Option value="all">ALL</Select.Option>
                        <Select.Option value="income">INCOME</Select.Option>
                        <Select.Option value="expense">EXPENSE</Select.Option>
                    </Select>
                </div>
                <div className="switch-icons">
                    <UnorderedListOutlined className={`mx-2 ${viewData === 'table' ? 'active-icon' : 'inactive-icon'}`}
                        onClick={() => setViewData('table')} />
                    <AreaChartOutlined className={`mx-2 ${viewData === 'analytics' ? 'active-icon' : 'inactive-icon'}`}
                        onClick={() => setViewData('analytics')} />
                </div>
                <div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Add New
                    </button>
                </div>
            </div>
            <div className="content">
                {viewData === 'table' ? 
                    <Table columns={columns} dataSource={allTransaction} />
                    : <Analytics allTransaction={allTransaction} />
                }
            </div>
            <Modal
                title={editable ? 'Edit Transaction' : 'Add Transaction'}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={false}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        ...editable,
                        date: editable ? moment(editable.date, "YYYY-MM-DD") : null, // Set date format for editing
                    }}
                >
                    <Form.Item
                        label="Amount"
                        name="amount"
                        rules={[{ required: true, message: "Please enter an amount" }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item
                        label="Type"
                        name="type"
                        rules={[{ required: true, message: "Please select a type" }]}
                    >
                        <Select>
                            <Select.Option value="income">Income</Select.Option>
                            <Select.Option value="expense">Expense</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: "Please select a category" }]}
                    >
                        <Select>
                            <Select.Option value="salary">Salary</Select.Option>
                            <Select.Option value="tip">Tip</Select.Option>
                            <Select.Option value="project">Project</Select.Option>
                            <Select.Option value="food">Food</Select.Option>
                            <Select.Option value="movie">Movie</Select.Option>
                            <Select.Option value="bills">Bills</Select.Option>
                            <Select.Option value="medical">Medical</Select.Option>
                            <Select.Option value="fees">Fees</Select.Option>
                            <Select.Option value="taxes">Taxes</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Date"
                        name="date"
                        rules={[{ required: true, message: "Please select a date" }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item label="Reference" name="reference">
                        <Input type="text" />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input type="text" />
                    </Form.Item>

                    <Form.Item>
                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">
                                SAVE
                            </button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default HomePage;
